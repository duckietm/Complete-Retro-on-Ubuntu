# NitroV3 UI Login Setup

## Linux — NGINX (latest mainline version)

## Prerequisites

In your Cloudflare dashboard, generate an Origin SSL certificate (Origin Certificate + Private Key) for your domain (Read the Cloudflare_And_SSL for more info).

Create the directory that will hold the certificate files:

```bash
mkdir -p /etc/ssl/cloudflare/
```

Paste the **Origin Certificate** content into `cert.pem`:

```bash
vi /etc/ssl/cloudflare/cert.pem
```

Paste the **Private Key** content into `key.pem`:

```bash
vi /etc/ssl/cloudflare/key.pem
```

Lock down the private key so it isn't world-readable:

```bash
chmod 600 /etc/ssl/cloudflare/key.pem
chmod 644 /etc/ssl/cloudflare/cert.pem
```

## NGINX setup

Clear the existing config and the default sites:

```bash
cd /etc/nginx
> nginx.conf                  # truncates the file to empty
rm sites-available/default
rm sites-enabled/default
```

Create the log directory **before** loading the new config (NGINX won't start if the configured log paths don't exist):

```bash
mkdir -p /var/log/nginx/cms
chown -R www-data:www-data /var/log/nginx/cms
```

Edit the main config:

```bash
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

Paste the following into `cms.conf`. **Replace `camwijs.eu` with your own domain in both the `map` regex and the `server_name`.** (Both must match, or CORS will block your gamedata/camera requests.)

```nginx
map $http_origin $cors_origin {
    default                              "";
    "~^https://(www\.)?example\.com$"     $http_origin;   # change to your domain (here you see example.com)
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;

    ssl_certificate     /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;

    server_name example.com www.example.com;          # change to your domain

    root  /var/www/Nitro-V3/dist;
    index index.php index.html index.htm;

    autoindex     off;
    server_tokens off;

    add_header Alt-Svc                   'h3=":443"; ma=86400';
    add_header X-Content-Type-Options    "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy           "strict-origin";
    add_header X-XSS-Protection          "1; mode=block";
    add_header Camwijs                   "This is an AtomCMS server in NL";
    add_header Permissions-Policy        "accelerometer=(), autoplay=(self), camera=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), sync-xhr=(), usb=()";

    client_header_buffer_size   1k;
    large_client_header_buffers 4 8k;

    access_log /var/log/nginx/cms/access.log custom buffer=32k;
    error_log  /var/log/nginx/cms/error.log;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /.vite/manifest.json {
        try_files $uri =404;
        default_type application/json;
        add_header Cache-Control "no-store" always;
    }

    location ~* ^/(assets|src/assets)/.+-[a-zA-Z0-9_]+\.(js|css|woff2?|ttf|otf|eot|svg|png|jpe?g|gif|webp|avif|map)$ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable" always;
    }

    location /configuration/ {
        try_files $uri =404;
        add_header Cache-Control "no-store" always;
    }

    location /gamedata/ {
        alias /var/www/gamedata/;

        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin   $cors_origin always;
            add_header Access-Control-Allow-Methods  "GET, POST, OPTIONS" always;
            add_header Access-Control-Allow-Headers  "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
            add_header Access-Control-Max-Age        1728000 always;
            add_header Vary                          Origin always;
            add_header Content-Length                0;
            return 204;
        }

        add_header Access-Control-Allow-Origin   $cors_origin always;
        add_header Access-Control-Allow-Methods  "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers  "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
        add_header Vary                          Origin always;

        try_files $uri $uri/ =404;

        location ~* \.(jpg|jpeg|png|gif|ico|nitro)$ {
            expires 30d;
            add_header Cache-Control               "public, no-transform";
            add_header Access-Control-Allow-Origin $cors_origin always;
            add_header Vary                        Origin       always;
        }
    }

    location /camera/ {
        alias /var/www/Camera/;

        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin   $cors_origin always;
            add_header Access-Control-Allow-Methods  "GET, POST, OPTIONS" always;
            add_header Access-Control-Allow-Headers  "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
            add_header Access-Control-Max-Age        1728000 always;
            add_header Vary                          Origin always;
            add_header Content-Length                0;
            return 204;
        }

        add_header Access-Control-Allow-Origin  $cors_origin always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
        add_header Vary                         Origin always;

        try_files $uri $uri/ =404;

        location ~ \.php$ {
            include snippets/fastcgi-php.conf;

            fastcgi_param SCRIPT_FILENAME    /var/www/Camera$fastcgi_script_name;
            fastcgi_param PHP_ADMIN_VALUE    "allow_url_fopen=0";
            fastcgi_param PHP_VALUE          "open_basedir=/var/www/Camera/:/tmp/";

            fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;     # adjust to your installed PHP-FPM version

            add_header Access-Control-Allow-Origin  $cors_origin always;
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range" always;
            add_header Vary                         Origin always;
        }
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_param PHP_ADMIN_VALUE "allow_url_fopen=0";
        fastcgi_param PHP_VALUE       "open_basedir=/var/www/:/tmp/";
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;         # adjust to your installed PHP-FPM version
    }
}
```

When finished, press `ESC`, type `:wq` and press Enter.

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

Restart NGINX and visit your site:

```bash
systemctl restart nginx
```

If something is wrong, run `nginx -t` — it will tell you exactly which line in which config file is the problem.

When everything is configured correctly, opening your domain in a browser should show the Nitro V3 UI login page.

## Updates

After pulling new changes to Nitro V3 or the renderer:

```bash
cd /var/www/Nitro_Render
git pull
yarn install && yarn link

cd /var/www/Nitro-V3
git pull
yarn install && yarn link "@nitrots/nitro-renderer"
yarn build
```

For the latest developments, join the Discord: <https://discord.gg/4qWBDeX9m>
