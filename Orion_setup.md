# OrionCMS Setup

## Linux — NGINX (latest mainline version)

This guide installs **OrionCMS** as the web front-end for your hotel. If you'd rather use AtomCMS, see [NGINX_Atom_setup.md](NGINX_Atom_setup.md) instead.

## Install OrionCMS

```bash
cd /var/www/
rm -r html
git clone https://github.com/Orion-Server/cms.git
cd cms
cp .env.example .env
```

## Configure the .env

Edit the settings — URL, database, etc.:

```bash
vi /var/www/cms/.env
```

Make it look like this (replace each placeholder with your real value):

```ini
APP_NAME="OrionCMS"
APP_ENV=production
APP_KEY=                                # Leave empty — `php artisan key:generate` will fill it in
APP_DEBUG=false
APP_URL=https://mydomain.com            # Your URL, no trailing slash

SESSION_DOMAIN=mydomain.com             # Match your APP_URL host
SESSION_DRIVER=file
SESSION_LIFETIME=120

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=habbo
DB_USERNAME=cms
DB_PASSWORD="YOUR PASSWORD"
```

## Install the CMS

```bash
cd /var/www/cms
composer install              # When prompted, press Enter to accept the default [yes]
yarn install && yarn build
php artisan key:generate
php artisan migrate --seed
chown -R www-data:www-data /var/www/cms/
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

## NGINX setup

Clear the existing config and the default sites:

```bash
cd /etc/nginx
> nginx.conf                  # truncates the file to empty
rm sites-available/default
rm sites-enabled/default
vi /etc/nginx/nginx.conf
```

Paste the following into `nginx.conf` (press `i` first to enter insert mode — you'll see `-- INSERT --` in the bottom-left corner):

```nginx
user www-data;
worker_processes auto;
worker_rlimit_nofile 20000;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 1024;
    multi_accept off;
}

http {
    ##
    # Basic settings
    ##
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;
    server_tokens off;
    # server_names_hash_bucket_size 64;
    # server_name_in_redirect off;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Rate limiting
    limit_conn_zone $binary_remote_addr zone=addr:10m;
    limit_req_zone  $binary_remote_addr zone=req_limit_per_ip:10m rate=25r/s;

    # SSL
    ssl_protocols TLSv1.2 TLSv1.3;          # TLSv1 / 1.1 are deprecated
    ssl_prefer_server_ciphers on;

    # Custom log format including Cloudflare country header
    log_format custom '$remote_user [$time_local] - $remote_addr : '
                      '"$request" $status $body_bytes_sent - '
                      'Refer:"$http_referer" Country:"$http_cf_ipcountry"';

    # Logging
    access_log /var/log/nginx/access.log;
    error_log  /var/log/nginx/error.log;

    # Gzip
    # gzip on;

    # Virtual host configs
    include /etc/nginx/cloudflare;
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

When finished, press `ESC`, then type `:wq` and press Enter. (No capitals — it's `:wq`, not `:WQ`.)

Now create the site config:

```bash
vi /etc/nginx/sites-available/cms.conf
```

Paste the following. **Replace `mydomain.com` with your own domain in `server_name`:**

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name mydomain.com www.mydomain.com;

    root  /var/www/cms/public;
    index index.php index.html index.htm;

    autoindex     off;
    server_tokens off;

    add_header X-Frame-Options           SAMEORIGIN;
    add_header X-Content-Type-Options    "nosniff" always;
    add_header Referrer-Policy           "strict-origin-when-cross-origin";
    add_header X-XSS-Protection          "1; mode=block";
    add_header Permissions-Policy        "autoplay=(self), encrypted-media=(), fullscreen=(), geolocation=(), microphone=(), midi=()";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    access_log /var/log/nginx/cms.log custom;
    error_log  /var/log/nginx/cms_error.log;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
        limit_conn addr 10;
        autoindex off;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_param PHP_ADMIN_VALUE "allow_url_fopen=1";       # Orion needs this for some integrations
        fastcgi_param PHP_VALUE       "open_basedir=/var/www/cms/:/tmp/";
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;          # Adjust to your installed PHP-FPM version
    }
}
```

## Cloudflare real-IP refresh script

To preserve the real visitor IP in your logs (instead of seeing Cloudflare's IPs), create a script that refreshes the Cloudflare IP ranges:

```bash
mkdir -p /var/scripts
vi /var/scripts/CF_Refresh.sh
```

Paste the following:

```bash
#!/bin/bash

CLOUDFLARE_FILE_PATH=/etc/nginx/cloudflare

echo "# Cloudflare"          >  $CLOUDFLARE_FILE_PATH
echo ""                      >> $CLOUDFLARE_FILE_PATH
echo "# IPv4"                >> $CLOUDFLARE_FILE_PATH
for i in $(curl -s https://www.cloudflare.com/ips-v4); do
    echo "set_real_ip_from $i;" >> $CLOUDFLARE_FILE_PATH
done

echo ""                      >> $CLOUDFLARE_FILE_PATH
echo "# IPv6"                >> $CLOUDFLARE_FILE_PATH
for i in $(curl -s https://www.cloudflare.com/ips-v6); do
    echo "set_real_ip_from $i;" >> $CLOUDFLARE_FILE_PATH
done

echo ""                                              >> $CLOUDFLARE_FILE_PATH
echo "real_ip_header CF-Connecting-IP;"              >> $CLOUDFLARE_FILE_PATH

# Test the new config and reload nginx
nginx -t && systemctl reload nginx
```

Make it executable and run it:

```bash
chmod +x /var/scripts/CF_Refresh.sh
/var/scripts/CF_Refresh.sh
```

> **Tip:** add this script to a weekly cron job so the Cloudflare ranges stay current:
>
> ```bash
> echo '0 4 * * 0 root /var/scripts/CF_Refresh.sh' > /etc/cron.d/cf-refresh
> ```

## Enable the site

Link the site config into `sites-enabled` so NGINX picks it up:

```bash
ln -s /etc/nginx/sites-available/cms.conf /etc/nginx/sites-enabled/
```

Restart NGINX:

```bash
systemctl restart nginx
```

If something is wrong, run `nginx -t` — it will tell you exactly which line in which config file is the problem.

## Updates

- Pull the latest changes from GitHub: `git pull`
- Update PHP dependencies: `composer update`
- Rebuild the theme after frontend changes: `yarn install && yarn build`
- Run new database migrations: `php artisan migrate`
