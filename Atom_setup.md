# AtomCMS Setup
### Linux NGINX latest mainline version

```
cd /var/www/
rm -r html
git clone https://github.com/ObjectRetros/atomcms.git
# If you want to use the Develop branch use then : git clone --single-branch --branch develop https://github.com/ObjectRetros/atomcms.git
cd atomcms
cp .env.example .env
```

### Now edit all the settings like URL / Database settings etc. in the .env: vi /var/www/atomcms/.env

Make it look like so:
```
APP_NAME="Habbo Hotel"
APP_ENV=production
APP_DEBUG=false
APP_URL="https://habbo.com"
DB_DATABASE="atom"
DB_USERNAME="root"
DB_PASSWORD="password"
TINYMCE_API_KEY="TINYMCEKEYHERE"
TURNSTILE_ENABLED=true
TURNSTILE_SITE_KEY="TURNSTILEKEY"
TURNSTILE_SECRET_KEY="TURNSTILESECRET"
FINDRETROS_NAME="habbohotel"
FINDRETROS_ENABLED=true # true or false
NITRO_IMAGER_URL (e.g. https://www.habbo.com/habbo-imaging/avatarimage)
NITRO_STATIC_URL (e.g. https://static.domain.com)
NITRO_CLIENT_URL (e.g. http://nitro.habhub.net)
NITRO_STATIC_PATH (e.g. /var/www/static.domain.com)
```

### Next install the CMS:
```
cd /var/www/atomcms
composer install # Press enter by [yes]
php artisan key:generate
php artisan storage:link
chown -R www-data:www-data /var/www/atomcms/
chmod -R 775 storage
chmod -R 775 bootstrap/cache
php artisan migrate
php artisan migrate --seed
yarn install
yarn build:atom
```

### NGINX Setup
```
cd /etc/nginx
>nginx.conf
rm sites-available/default
rm sites-enabled/default
vi /etc/nginx/nginx.conf
```

### Paste the following in the nginx.conf
(First press the letter i before pasting you will see in the left corner the text -- INSERT --)
```
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
        # Basic Settings
        ##
        sendfile on;
        tcp_nopush on;
        tcp_nodelay on;
        keepalive_timeout 65;
        types_hash_max_size 2048;
        client_max_body_size 100M;
        # server_tokens off;
        # server_names_hash_bucket_size 64;
        # server_name_in_redirect off;
        include /etc/nginx/mime.types;
        default_type application/octet-stream;
        # Rate limiting
        limit_conn_zone $binary_remote_addr zone=addr:10m;
        limit_req_zone $binary_remote_addr zone=req_limit_per_ip:10m rate=25r/s;
        # SSL Settings
        log_format custom '$remote_user [$time_local] - $remote_addr :'
        '"$request" $status $body_bytes_sent - '
        'Refer:"$http_referer" Country:"$http_cf_ipcountry"';
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
        # Dropping SSLv3, ref: POODLE
        ssl_prefer_server_ciphers on;
        # Logging Settings
        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;
        # Gzip Settings
        #gzip on;
        # Virtual Host Configs
        include /etc/nginx/cloudflare;
        include /etc/nginx/conf.d/*.conf;
        include /etc/nginx/sites-enabled/*;
}
```
When pasted press [ESC] then type :wq #make sure that there are no capitals

Now run : ```vi /etc/nginx/sites-available/cms.conf``` Paste the following in the cms.conf file, And change the ###URL### to your domain

```
server {
        listen 80;
        listen [::]:80;
        
        index index.php index.html index.htm;
        autoindex off;
        server_tokens off;
        add_header X-Frame-Options SAMEORIGIN;
        add_header AtomCMS "This is an SpongeBob server";
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin";
        add_header X-XSS-Protection "1; mode=block";
        add_header Permissions-Policy "autoplay=(self), encrypted-media=(), fullscreen=(), geolocation=(), microphone=(), midi=()";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        access_log /var/log/nginx/cms.log custom;
        error_log /var/log/nginx/cms_error.log;

        server_name ###URL###;
        
        root /var/www/atomcms/public;
        index index.php index.html index.htm;
        location / {
        try_files $uri $uri/ /index.php?$query_string;
        limit_conn addr 10;
        autoindex off;
        }
        location ~ \.php$ {
                include snippets/fastcgi-php.conf;
                fastcgi_param PHP_ADMIN_VALUE "allow_url_fopen=1";
                fastcgi_param PHP_VALUE open_basedir="/var/www/atomcms/:/tmp/";
                fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        }
}
```

## Cloudflare
We will make a script for Cloudflare to access with RealIP in the logs
```
mkdir /var/scripts
vi /var/scripts/CF_Refresh.cf
```

Paste the following config:
```
#!/bin/bash

CLOUDFLARE_FILE_PATH=/etc/nginx/cloudflare
echo "#Cloudflare" > $CLOUDFLARE_FILE_PATH;
echo "" >> $CLOUDFLARE_FILE_PATH;
echo "# - IPv4" >> $CLOUDFLARE_FILE_PATH;
for i in `curl https://www.cloudflare.com/ips-v4`; do
    echo "set_real_ip_from $i;" >> $CLOUDFLARE_FILE_PATH;
done
echo "" >> $CLOUDFLARE_FILE_PATH;
echo "# - IPv6" >> $CLOUDFLARE_FILE_PATH;
for i in `curl https://www.cloudflare.com/ips-v6`; do
    echo "set_real_ip_from $i;" >> $CLOUDFLARE_FILE_PATH;
done
echo "" >> $CLOUDFLARE_FILE_PATH;
echo "real_ip_header CF-Connecting-IP;" >> $CLOUDFLARE_FILE_PATH;
echo "add_header CF-IPCountry $http_cf_connecting_ip always;" >> $CLOUDFLARE_FILE_PATH;
#test configuration and reload nginx
nginx -t && systemctl reload nginx
```

Now make it executable and run the script
```
chmod +x /var/scripts/CF_Refresh.cf
/var/scripts/CF_Refresh.sh
```

Now lets bind the config to nginx:
```ln -s /etc/nginx/sites-available/cms.conf /etc/nginx/sites-enabled/```

restart nginx and test your site : ```/etc/init.d/nginx restart```
If there is something wrong just run : ```nginx -t``` and it will show you what is going on.

Now Run through the installer of AtomCMS <== The license key can be found in the Database ```SELECT * FROM website_installation;```

## Updates

- How to import changes from github : ```git pull```

- Update the packages : ```composer update```

- Rebuild the theme (when changes are made to the frontend) : ```yarn build:atom```

- Run the migrations : ```php artisan migrate```

Please use discord to see all the latest developments of Atom at : https://discord.gg/HEqEwK2B
