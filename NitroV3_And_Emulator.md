# Install Nitro-V3

## Recommended folder structure

```
.
├── Camera/
├── emulator/
├── gamedata/
│   ├── bundled/
│   │   └── generic/
│   ├── c_images/
│   │   ├── album1584/
│   │   ├── backgrounds/
│   │   ├── catalogue/
│   │   │   ├── feature_cata/
│   │   │   └── paginascatalogo/
│   │   ├── Habbo-Stories/
│   │   ├── habbo-web-articles/
│   │   ├── level/
│   │   │   ├── backgrounds/
│   │   │   ├── furni/
│   │   │   ├── prefix/
│   │   │   └── teaser/
│   │   ├── notifications/
│   │   │   └── customwireds/
│   │   ├── playlist/
│   │   ├── Quests/
│   │   └── reception/
│   │       ├── catalogue/
│   │       └── web_promo_small/
│   ├── clothes/
│   ├── config/
│   ├── custom/
│   ├── effect/
│   ├── furniture/
│   ├── generic_custom/
│   │   ├── new/
│   │   └── org/
│   ├── habbopages/
│   │   ├── chat/
│   │   │   └── chatting/
│   │   └── navigator/
│   ├── icons/
│   ├── images/
│   │   ├── additions/
│   │   ├── events/
│   │   ├── furniextras/
│   │   ├── navigator/
│   │   │   └── models/
│   │   ├── reception/
│   │   ├── rules/
│   │   └── wallet/
│   ├── pets/
│   ├── sounds/
│   └── web_promo_small/
├── news/
├── Nitro_Render_V3/
└── Nitro/
```

## Get Nitro and Nitro Renderer

First, run the following commands to clone all the source repositories into place:

```bash
git clone https://github.com/duckietm/Arcturus-Morningstar-Extended.git /var/www/emulator && \
git clone https://github.com/duckietm/Nitro_Render_V3.git && \
git clone https://github.com/duckietm/Nitro-V3.git
```

## Configure the emulator

First, install the JDK and Maven required to build the emulator:

```shell
apt install openjdk-25-jdk
apt install maven
```

Next, build the JAR file:

```shell
cd /var/www/emulator/Emulator
mvn clean package
```

When the build completes, take note of the version number. The output will look something like this:

```text
[INFO] --- jar:3.1.2:jar (default-jar) @ Habbo ---
[INFO] Building jar: /var/www/emulator/Emulator/target/Habbo-4.1.15.jar
[INFO]
[INFO] --- assembly:3.7.1:single (make-assembly) @ Habbo ---
[INFO] Building jar: /var/www/emulator/Emulator/target/Habbo-4.1.15-jar-with-dependencies.jar
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  34.146 s
[INFO] Finished at: 2026-05-13T06:18:19Z
[INFO] ------------------------------------------------------------------------
```

Create the `config.ini` for the emulator:

```shell
cd /var/www/emulator/Emulator/target/
vi config.ini
```

```ini
# Database configuration
db.hostname=127.0.0.1
db.port=3306
db.database=habbo                    # DB name
db.username=root                     # Username
db.password=root                     # Password
db.params=?characterEncoding=utf8&useSSL=false&serverTimezone=Europe/Amsterdam   # Set your timezone; use capitals as in the example
db.pool.minsize=25
db.pool.maxsize=100

# Optional packet signing for encrypted WebSocket traffic.
crypto.ws.signing.enabled=false
# Optional persistent signing keys. Leave empty to auto-generate and persist them in emulator_settings.
crypto.ws.signing.public_key=
crypto.ws.signing.private_key=

# Game configuration
# Host IP. Use 0.0.0.0 in most cases. Use 127.0.0.1 if you only want to play on LAN.
game.host=0.0.0.0
game.port=3000

# RCON configuration
# Leave the host at 127.0.0.1 if your website runs on the same server as the emulator.
rcon.host=127.0.0.1
rcon.port=3001
rcon.allowed=127.0.0.1;127.0.0.2

# WebSocket configuration (for Nitro)
# Set ws.enabled to true to enable WebSocket connections.
ws.enabled=true
ws.host=0.0.0.0
ws.port=2096
# Comma-separated whitelist of allowed origins. Supports wildcards: *.example.com, * (allow all)
ws.whitelist=localhost,127.0.0.1,*.localhost   # This is also used for CORS on the API, so set it to your domain in production!
# Header name for the real client IP when behind a proxy (e.g. X-Forwarded-For, CF-Connecting-IP). Leave empty if not behind a proxy.
ws.ip.header=X-Forwarded-For

# Database connection pool
db.pool.connection_timeout_ms = 10000
db.pool.idle_timeout_ms       = 600000
db.pool.max_lifetime_ms       = 1800000
db.pool.validation_timeout_ms = 5000
# Set db.pool.leak_detection_ms to 0 to disable leak detection
db.pool.leak_detection_ms     = 20000

enc.enabled=false
enc.e=3
enc.n=86851dd364d5c5cece3c883171cc6ddc5760779b992482bd1e20dd296888df91b33b936a7b93f06d29e8870f703a216257dec7c81de0058fea4cc5116f75e6efc4e9113513e45357dc3fd43d4efab5963ef178b78bd61e81a14c603b24c8bcce0a12230b320045498edc29282ff0603bc7b7dae8fc1b05b52b2f301a9dc783b7
enc.d=59ae13e243392e89ded305764bdd9e92e4eafa67bb6dac7e1415e8c645b0950bccd26246fd0d4af37145af5fa026c0ec3a94853013eaae5ff1888360f4f9449ee023762ec195dff3f30ca0b08b8c947e3859877b5d7dced5c8715c58b53740b84e11fbc71349a27c31745fcefeeea57cff291099205e230e0c7c27e8e1c0512b

# Nitro secure runtime assets. JSON files are read live from disk.
nitro.secure.assets.enabled=false
nitro.secure.api.enabled=false

# Secure runtime ECDH session TTL in seconds.
nitro.secure.session_ttl_sec=900

# Point this to your deployed Nitro /configuration folder when secure config assets are enabled.
nitro.secure.config.root=
nitro.secure.gamedata.root=

# Set a persistent secret when using Cloudflare or multiple backend requests.
nitro.secure.master_key=change-me-to-a-long-random-secret

# Remember-me login tokens.
login.remember.enabled=true
login.remember.duration.days=30

# Optional: set a persistent remember-me JWT secret here. Otherwise one is generated and stored in emulator_settings.
login.remember.jwt.secret=

# Login news API.
login.news.limit=5
```

To save and quit in `vi`, type `:wq` and press Enter.

Next, create the launcher script:

```shell
vi emulator
```

Paste the following (press **a** first to enter insert mode). **Update `Habbo-4.1.15-jar-with-dependencies.jar` to match the version you noted earlier!**

```bash
#!/bin/sh
file_name_emulator=emulator.log
current_time=$(date "+%H%M_%d-%m-%Y")
file_name=$file_name_emulator.$current_time
mv /var/log/emu/emulator.log /var/log/emu/$file_name
java -Dfile.encoding=UTF8 -Xmx4096m -jar /var/www/emulator/Emulator/target/Habbo-4.1.15-jar-with-dependencies.jar >/var/log/emu/emulator.log
```

Note: `-Xmx4096m` gives the emulator 4 GB of memory. You can set this to any amount in MB:

- 1 GB = 1024
- 2 GB = 2048
- 3 GB = 3072
- 4 GB = 4096

Make the script executable:

```shell
chmod +x emulator
```

Create the directory for the emulator log files:

```shell
mkdir /var/log/emu
```

> **Warning:** run the SQL below only **once**, and only after you have imported the database as described in the CMS setup.

```sql
mariadb
USE your_database;
UPDATE emulator_settings SET `value` = '0' WHERE `key` = 'console.mode';
UPDATE emulator_settings SET `value` = '### YOUR WEBSOCKET WHITELIST e.g. domain.com,*.domain.com,localhost,127.0.0.1 ###' WHERE `key` = 'websockets.whitelist';
```

`console.mode` must be `0`, and the whitelist domain must match the one you set in `config.ini`.

Next, create the emulator systemd service so it starts automatically on boot:

```shell
vi /etc/systemd/system/emulator.service
```

Paste the following (press **a** first):

```ini
[Unit]
Description=Habbo Emulator

# Make sure the database has started before the emulator can start
After=mariadb.service
Requires=mariadb.service

# If you want to run as a less privileged account, change User below.
# Make sure that account has the right permissions on the working directory and target folders.
[Service]
User=root

# Working directory where config.ini and the JAR live
WorkingDirectory=/var/www/emulator/Emulator/target

# The launcher script we created above. It is a shell wrapper that calls the JAR.
ExecStart=/var/www/emulator/Emulator/target/emulator

SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Before enabling the service, test the emulator manually:

```shell
cd /var/www/emulator/Emulator/target
java -Dfile.encoding=UTF8 -Xmx4096m -jar /var/www/emulator/Emulator/target/Habbo-4.1.15-jar-with-dependencies.jar   # Check the version!
```

Once it has fully started, you are almost ready to go. Press `CTRL+C` to exit the emulator, then enable and start the service:

```shell
systemctl enable emulator.service
systemctl start emulator.service
```

Check that everything started cleanly:

```shell
cat /var/log/emulator.log
```

- To stop the emulator: `systemctl stop emulator.service`
- To follow the log live: `tail -f /var/log/emulator.log` (press `CTRL+C` to exit)

Finally, test that the emulator starts automatically after a reboot:

```shell
>/var/log/emulator.log
reboot
```

# Nitro V3 and Nitro Renderer

We recommend using WinSCP to edit these files — it is much easier than editing them in the terminal.

Connect to the VPS and go to `/var/www/Nitro-V3/public/configuration`. Rename each `.example` file to `.json`:

- `client-mode.json`
- `hotlooks.json`
- `infostand_backgrounds.json`
- `news.json`
- `renderer-config.json`
- `ui-config.json`

Now edit `renderer-config.json`:

```json
"socket.url": "wss://##MY_DOMAIN.COM##:2096",
"crypto.ws.enabled": false,
"crypto.ws.signing.enabled": false,
"crypto.ws.signing.public_key": "",
"api.url": "https://##MY_DOMAIN.COM##:2096",
"asset.url": "https://##MY_DOMAIN.COM##/gamedata",
"image.library.url": "http://##MY_DOMAIN.COM##/gamedata/c_images/",
"hof.furni.url": "https://##MY_DOMAIN.COM##",
"images.url": "${asset.url}/images",
"gamedata.url": "${asset.url}",
"sounds.url": "${asset.url}/sounds/%sample%.mp3",
"external.texts.url": [
    "${gamedata.url}/config/ExternalTexts.json?v=1",
    "${gamedata.url}/config/UITexts.json?v=1"
],
"external.samples.url": "${gamedata.url}/sounds/sound_machine_sample_%sample%.mp3",
"furnidata.url": "${gamedata.url}/config/FurnitureData.json?v=1",
"productdata.url": "${gamedata.url}/config/ProductData.json?v=1",
"avatar.actions.url": "${gamedata.url}/config/HabboAvatarActions.json?v=1",
"avatar.figuredata.url": "${gamedata.url}/config/FigureData.json?v=1",
"avatar.figuremap.url": "${gamedata.url}/config/FigureMap.json?v=1",
"avatar.effectmap.url": "${gamedata.url}/config/EffectMap.json?v=1",
"avatar.asset.url": "${asset.url}/clothes/%libname%.nitro",
"avatar.asset.effect.url": "${asset.url}/effect/%libname%.nitro",
"furni.asset.url": "${asset.url}/furniture/%libname%.nitro",
"furni.asset.icon.url": "http://##MY_DOMAIN.COM##/gamedata/icons/%libname%%param%_icon.png",
"pet.asset.url": "${asset.url}/pets/%libname%.nitro",
"generic.asset.url": "${asset.url}/bundled/generic/%libname%.nitro",
"room.asset.url": "${asset.url}/room/%libname%/%libname%.json",
"badge.asset.url": "${image.library.url}album1584/%badgename%.gif",
"badge.asset.group.url": "http://##MY_DOMAIN.COM##/habbo-imaging/badge/%badgedata%",
"badge.asset.group.external.url": "",
"badge.asset.grouparts.url": "https://##MY_DOMAIN.COM##/gamedata/badgeparts/badgepart_%part%.png",
"furni.rotation.bounce.steps": 20,
"furni.rotation.bounce.height": 0.0625,
"room.color.skip.transition": false,
"enable.avatar.arrow": false,
"system.animation.fps": 60,
"system.limits.fps": false,
"system.dispatcher.log": false,
"system.packet.log": false,
"system.pong.manually": true,
"system.pong.interval.ms": 20000,
"room.color.skip.transition": true,
"user.badges.group.slot.enabled": true,
"timezone.settings": "Europe/Amsterdam",
"login.screen.enabled": true,
"login.endpoint": "${api.url}/api/auth/login",
"login.register.endpoint": "${api.url}/api/auth/register",
"login.forgot.endpoint": "${api.url}/api/auth/forgot-password",
"login.logout.endpoint": "${api.url}/api/auth/logout",
"login.health.endpoint": "${api.url}/api/health",
"login.check-email.endpoint": "${api.url}/api/auth/check-email",
"login.check-username.endpoint": "${api.url}/api/auth/check-username",
"login.room_templates.endpoint": "${api.url}/api/auth/room-templates",
"login.remember.endpoint": "${api.url}/api/auth/remember",
"login.server_key.endpoint": "${api.url}/api/auth/server-key",
"login.sso-token.endpoint": "${api.url}/api/auth/sso-token",
"login.refresh.endpoint": "${api.url}/api/auth/refresh",
"badges.custom.list.endpoint":   "${api.url}/api/badges/custom",
"badges.custom.create.endpoint": "${api.url}/api/badges/custom",
"badges.custom.update.endpoint": "${api.url}/api/badges/custom/%badgeId%",
"badges.custom.delete.endpoint": "${api.url}/api/badges/custom/%badgeId%",
"badges.custom.texts.endpoint":  "${api.url}/api/badges/custom/texts",
"account.change-password.endpoint": "${api.url}/api/auth/change-password",
"account.change-email.endpoint":    "${api.url}/api/auth/change-email",
"account.change-username.endpoint": "${api.url}/api/auth/change-username",
"login.health.method": "GET",
"login.news.url": "${asset.url}/news/news.json",
"login.turnstile.enabled": false,
"login.turnstile.sitekey": "",
"avatar.mandatory.libraries": ["bd:1", "li:0"],
"avatar.mandatory.effect.libraries": [
    "dance.1",
    "dance.2",
    "dance.3",
    "dance.4"
],
```

Replace `##MY_DOMAIN.COM##` with your domain. If you are using Cloudflare, make sure you have created the SSL bypass page rule for `https://##MY_DOMAIN.COM##:2096/*` (the trailing `*` is required).

Next, configure `ui-config.json`:

```json
"image.library.notifications.url": "${image.library.url}notifications/%image%.png",
"achievements.images.url": "${image.library.url}Quests/%image%.png",
"camera.url": "https://##MY_DOMAIN.COM##/camera/photo",
"thumbnails.url": "https://##MY_DOMAIN.COM##/camera/photo/thumb/%thumbnail%.png",
"url.prefix": "",
"habbopages.url": "/gamedata/habbopages/",
"group.homepage.url": "${url.prefix}/groups/%groupid%/id",
"guide.help.alpha.groupid": 0,
"chat.viewer.height.percentage": 0.4,
"widget.dimmer.colorwheel": false,
"avatar.wardrobe.max.slots": 10,
"user.badges.max.slots": 5,
"camera.publish.disabled": false,
"hc.disabled": false,
"badge.descriptions.enabled": true,
"motto.max.length": 38,
"bot.name.max.length": 15,
"wired.action.bot.talk.to.avatar.max.length": 64,
"wired.action.bot.talk.max.length": 64,
"wired.action.chat.max.length": 100,
"wired.action.kick.from.room.max.length": 100,
"wired.action.mute.user.max.length": 100,
"game.center.enabled": false,
"catalog.style.new": true,
"show.google.ads": false,
"loginview": {
    "images": {
        "background": "${asset.url}/c_images/reception/stretch_blue.png",
        "background.colour": "#6eadc8",
        "sun": "${asset.url}/c_images/reception/sun.png",
        "drape": "${asset.url}/c_images/reception/drape.png",
        "left": "${asset.url}/c_images/reception/ts.png",
        "right": "${asset.url}/c_images/reception/US_right.png",
        "right.repeat": "${asset.url}/c_images/reception/US_top_right.png"
    }
},
```

Next, edit `client-mode.json`. Important: use the **WebSocket address** as `apiBaseUrl`.

```json
{
    "distObfuscationEnabled": false,
    "secureAssetsEnabled": false,
    "secureApiEnabled": false,
    "apiBaseUrl": "https://###MY_DOMAIN###:2096",
    "plainConfigBaseUrl": "https://###MY_DOMAIN###/configuration/",
    "plainGamedataBaseUrl": "https://###MY_DOMAIN###/gamedata/"
}
```

Once everything is configured, compile Nitro V3:

```shell
cd /var/www/Nitro_Render_V3
yarn install && yarn link
cd /var/www/Nitro-V3/
yarn install && yarn link "@nitrots/nitro-renderer"
yarn build
```

When NGINX is configured correctly, you should see the UI login page.

# WebSocket configuration

In the emulator directory there is a file called `config.ini`. The relevant WebSocket settings are:

- `ws.enabled` — set to `true` to enable WebSocket support
- `ws.host` — host IP. Leave at `0.0.0.0` in most cases
- `ws.port` — host port. Can be any port, but read the Cloudflare section below if you want to proxy WSS traffic through Cloudflare
- `ws.ip.header` — header used to obtain the real client IP when the server is behind a proxy. Usually `X-Forwarded-For`, or `CF-Connecting-IP` when behind Cloudflare

## Connecting to the emulator over Secure WebSockets (WSS)

You have several options to add WSS support to the WebSocket server:

- Add your certificate and key to `/ssl/cert.pem` and `/ssl/privkey.pem` to enable WSS directly on the server. **Note:** the client will not accept self-signed certificates — you must use a certificate signed by a CA. You can get one for free from [letsencrypt.org](https://letsencrypt.org).
- Or, proxy WSS through Cloudflare or NGINX. **Note:** adding a proxy means you will need to configure `ws.ip.header` so the plugin can obtain the player's real IP address instead of the proxy's IP.

### Proxying WSS with Cloudflare

You can proxy WSS traffic through Cloudflare easily. First, make sure that `ws.port` is set to a port that Cloudflare lists as HTTPS-compatible:
[https://developers.cloudflare.com/fundamentals/reference/network-ports/](https://developers.cloudflare.com/fundamentals/reference/network-ports/)

At the time of writing, the following ports are compatible:

- 443
- 2053
- 2083
- 2087
- 2096
- 8443

Once your port is set to a compatible value, create a new `A` record for the subdomain that will handle WebSocket connections. Make sure it is set to **Proxied** (the cloud icon should be orange). Point it to your emulator's IP.

Example: create a DNS record `sockets.yourdomain.com` in Cloudflare, point it to your server IP, and enable Proxied.

Finally, create a new Page Rule under the Page Rules tab in Cloudflare and disable SSL for the subdomain you created above (`https://example.com:2096/*`).

You will then be able to connect using secure WebSockets via a URL like `wss://example.com:2096`, where `example.com` is your A-record subdomain and `2096` matches the `ws.port` value in your `config.ini`.
