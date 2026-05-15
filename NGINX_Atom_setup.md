# AtomCMS Setup

## Linux — NGINX (latest mainline version)

Before you start, make sure you have completed this step first:
<https://github.com/duckietm/Complete-Retro-on-Ubuntu/blob/main/NGINX_UI-Setup.md>

NitroV3 and NGINX must already be working 100% before you continue.

This guide will modify the existing NGINX/UI setup so you can use AtomCMS as your front-end instead of Nitro's built-in UI login. For most users with limited Linux experience, I recommend using WinSCP to edit files — it's much easier than working in a terminal.

## Install AtomCMS

```bash
cd /var/www/
rm -r html
git clone https://github.com/ObjectRetros/atomcms.git
# To use the develop branch instead, run:
# git clone --single-branch --branch develop https://github.com/ObjectRetros/atomcms.git
cd atomcms
cp .env.example .env
```

## Configure the .env

Edit the settings — URL, database, etc.:

```bash
vi /var/www/atomcms/.env
```

Make it look like this (replace each placeholder with your real value):

```ini
APP_NAME="example"            # Your hotel name
APP_ENV=production
APP_KEY=                      # Leave empty — `php artisan key:generate` will fill it in
APP_DEBUG=false
APP_URL=https://example.com   # Your URL, no trailing slash

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1             # Use 127.0.0.1 for a local MariaDB/MySQL install
DB_PORT=3306
DB_DATABASE=habbo             # Database name
DB_USERNAME=cms               # Database user — do NOT use root
DB_PASSWORD=MyPassword        # Database password

# ... other defaults from .env.example ...

# Turnstile
TURNSTILE_SITE_KEY=0x4AAAAAxxxxxxx     # Turnstile site key
TURNSTILE_SECRET_KEY=0x4AAAAAAxxxxxxx  # Turnstile secret key

# Enable this if your site runs over HTTPS but you see requests going to "http"
FORCE_HTTPS=true
```

## Install the CMS

```bash
cd /var/www/atomcms
composer install     # When prompted, press Enter to accept the default [yes]
```

If composer prompts you with `Username:`, that means it's trying to authenticate against the private FilamentPHP package repository. If you don't use any paid Filament plugins, you can skip the auth by editing `composer.json` and removing **both** of the following.

Remove this dependency line:

```json
"filament/blueprint": "^2.1",
```

And remove this repository block:

```json
{
    "name": "filament",
    "type": "composer",
    "url": "https://packages.filamentphp.com/composer"
}
```

Then retry `composer install`. Continue with:

```bash
php artisan key:generate
php artisan storage:link
chown -R www-data:www-data /var/www/atomcms/
chmod -R 775 storage
chmod -R 775 bootstrap/cache
php artisan migrate
```

If you get the following error:

```
Base table or view already exists: 1050 Table 'password_resets' already exists
```

…it means an older table is left over from a previous install. On a **fresh install only** (no real user data yet), drop the conflicting table and retry:

```bash
mariadb
USE habbo;                    # Replace with your database name
DROP TABLE password_resets;
EXIT;
```

> **Warning:** never run `DROP TABLE` on a database that has live user data unless you know what you're doing.

Then continue:

```bash
php artisan migrate --seed
yarn install
yarn build:atom
```

You've now successfully installed AtomCMS and built it.

## NGINX changes

Now modify the existing NGINX site config to point at AtomCMS and serve Nitro V3 from `/client`:

```bash
cd /etc/nginx/sites-available
vi cms.conf
```

You need to:

1. Change the `root` to AtomCMS's `public` directory.
2. Add a `/client/` location that aliases the Nitro V3 `dist` folder.

The relevant snippet should look like this:

```nginx
root  /var/www/atomcms/public;

location / {
    try_files $uri $uri/ /index.php?$query_string;
}

location /client/ {
    alias /var/www/Nitro-V3/dist/;
}
```

In context, your `cms.conf` should now have:

```nginx
# ...
root  /var/www/atomcms/public;
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

location /client/ {
    alias /var/www/Nitro-V3/dist/;
}

location = /.vite/manifest.json {
    try_files $uri =404;
    default_type application/json;
    add_header Cache-Control "no-store" always;
}
# ...
```

Restart NGINX:

```bash
systemctl restart nginx
```

If something is wrong, run `nginx -t` — it will tell you exactly which line in which config file is the problem.

## Run the AtomCMS installer

You can now visit your domain in a browser and follow the AtomCMS install wizard. The installer license key is stored in the database:

```sql
SELECT * FROM website_installation;
```

When the installer asks for paths, use the following:

```text
Nitro external texts file:
/var/www/Nitro-V3/dist/configuration/ExternalTexts.json

Badges path:
/gamedata/c_images/album1584

Group badge path:
/gamedata/Badgeparts/generated

Furniture icons path:
/

# This one is important:
Nitro path:
/client
```

## Configure Nitro V3 for the /client subpath

A few changes are required in Nitro V3 to make it work as a sub-app under `/client`.

### 1. Update package.json

```bash
cd /var/www/Nitro-V3/
vi package.json
```

Find these two lines:

```json
"start": "vite --host",
"build": "vite build && node scripts/minify-dist.mjs",
```

Change them to:

```json
"start": "vite --base=/client/ --host",
"build": "vite --base=/client/ build && node scripts/minify-dist.mjs",
```

### 2. Update client-mode.json

> **Important:** edit files in `/var/www/Nitro-V3/public/configuration`, **never** in `/dist`. The `dist` folder is regenerated every time you build and any changes there will be wiped out.

```bash
cd /var/www/Nitro-V3/public/configuration
vi client-mode.json
```

Set it to:

```json
{
    "distObfuscationEnabled": false,
    "secureAssetsEnabled": false,
    "secureApiEnabled": false,
    "apiBaseUrl": "https://###MY_DOMAIN###:2096",
    "plainConfigBaseUrl": "https://###MY_DOMAIN###/client/configuration/",
    "plainGamedataBaseUrl": "https://###MY_DOMAIN###/gamedata/"
}
```

Note: only `plainConfigBaseUrl` needs the `/client/` prefix. `plainGamedataBaseUrl` does not, because gamedata is served from the root `/gamedata/` path.

### 3. Disable the built-in Nitro login screen

Since AtomCMS now handles login, disable Nitro's built-in login:

```bash
vi /var/www/Nitro-V3/public/configuration/renderer-config.json
```

Set:

```json
"login.screen.enabled": false,
```

### 4. Rebuild Nitro V3

```bash
cd /var/www/Nitro-V3/
yarn build
```

## Updates

- Pull the latest changes from GitHub: `git pull`
- Update PHP dependencies: `composer update`
- Rebuild the theme after frontend changes: `yarn install && yarn build:atom`
- Run new database migrations: `php artisan migrate`

For the latest Atom developments, join the Discord: <https://discord.gg/HEqEwK2B>
