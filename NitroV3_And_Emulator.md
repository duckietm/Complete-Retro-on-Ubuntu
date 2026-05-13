# Install Nitro-V3 

## Folder structure that we recomend

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
├── Nitro_Render/
└── Nitro/
```
## Get Nitro and Nitro Renderer:

First run the following to get all the source in place :
```cmd
git clone https://github.com/duckietm/Arcturus-Morningstar-Extended.git /var/www/emulator &&
git clone https://github.com/duckietm/Nitro_Render_V3.git /var/www/Nitro_Render &&
git clone https://github.com/duckietm/Nitro-V3.git
```

## Configure the emulator

First install JDK and maven for the emulator:
```shell
apt install openjdk-25-jdk
apt install maven
```

Next we build the jar file:
```shell
cd /var/www/emulator/Emulator
mvn clean package
```

When the build is complete please note down the build !
It will looks something like : 
```dir
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

Create the config.ini for the emulator:
```shell
cd /var/www/emulator/Emulator/target/
vi config.ini
```

```ini
#Database Configuration.
db.hostname=127.0.0.1
db.port=3306
db.database=habbo # DB NAME
db.username=root # Username
db.password=root # Password
db.params= db.params=?characterEncoding=utf8&useSSL=false&serverTimezone=Europe/Amsterdam ## Set your timezone beware Use capitals like in the example 
db.pool.minsize=25
db.pool.maxsize=100

# Optional packet signing for encrypted WebSocket traffic.

crypto.ws.signing.enabled=false
# Optional persistent signing keys. Leave empty to auto-generate/persist them in emulator_settings.
crypto.ws.signing.public_key=
crypto.ws.signing.private_key=

#Game Configuration.
#Host IP. Most likely just 0.0.0.0 Use 127.0.0.1 if you want to play on LAN.
game.host=0.0.0.0
game.port=3000

#RCON Configuration.
#RCON Host IP. Leave this at 127.0.0.1 if you're running your website on the same server as the emulator.
rcon.host=127.0.0.1
rcon.port=3001
rcon.allowed=127.0.0.1;127.0.0.2

#WebSocket Configuration (for Nitro)
#Set ws.enabled to true to enable WebSocket connections.
ws.enabled=true
ws.host=0.0.0.0
ws.port=2096
#Comma-separated whitelist of allowed origins. Supports wildcards: *.example.com, * (allow all)
ws.whitelist=localhost,127.0.0.01,*.localhost  # This is also the parameter for CORS on the API so change that to your domain !
# !!!!! Header name for real client IP when behind a proxy (e.g., X-Forwarded-For, CF-Connecting-IP). Leave empty if not using a proxy. !!!!!
ws.ip.header=X-Forwarded-For

# Databse configuration
db.pool.connection_timeout_ms = 10000
db.pool.idle_timeout_ms       = 600000
db.pool.max_lifetime_ms       = 1800000
db.pool.validation_timeout_ms = 5000
# set db.pool.leak_detection_ms to 0 to disable
db.pool.leak_detection_ms     = 20000 # set to 0 to disable

enc.enabled=false
enc.e=3
enc.n=86851dd364d5c5cece3c883171cc6ddc5760779b992482bd1e20dd296888df91b33b936a7b93f06d29e8870f703a216257dec7c81de0058fea4cc5116f75e6efc4e9113513e45357dc3fd43d4efab5963ef178b78bd61e81a14c603b24c8bcce0a12230b320045498edc29282ff0603bc7b7dae8fc1b05b52b2f301a9dc783b7
enc.d=59ae13e243392e89ded305764bdd9e92e4eafa67bb6dac7e1415e8c645b0950bccd26246fd0d4af37145af5fa026c0ec3a94853013eaae5ff1888360f4f9449ee023762ec195dff3f30ca0b08b8c947e3859877b5d7dced5c8715c58b53740b84e11fbc71349a27c31745fcefeeea57cff291099205e230e0c7c27e8e1c0512b

# Nitro secure runtime assets. JSON files are read live from disk.
nitro.secure.assets.enabled=false
nitro.secure.api.enabled=false

# Secure runtime ECDH session TTL in seconds.
nitro.secure.session_ttl_sec=900

# Point this to your deployed Nitro `/configuration` folder when secure config assets are enabled.
nitro.secure.config.root=
nitro.secure.gamedata.root=

# Set a persistent secret when using Cloudflare / multiple backend requests.
nitro.secure.master_key=change-me-to-a-long-random-secret

# Remember-me login tokens.
login.remember.enabled=true
login.remember.duration.days=30

# Optional: set a persistent remember-me JWT secret here, otherwise one is generated and stored in emulator_settings.
login.remember.jwt.secret=

# Login news API.
login.news.limit=5

``` 
to save type ":wq!"   <-- no quotes
```shell
vi emulator
```
paste the following (press **a** before pasting) !!! Please change the Habbo-4.1.15-jar-with-dependencies.jar to the rigth version as you noted !!!
```
#!/bin/sh
file_name_emulator=emulator.log
current_time=$(date "+%H%M_%d-%m-%M")
file_name=$file_name_emulator.$current_time
mv /var/log/emu/emulator.log /var/log/emu/$file_name
java -Dfile.encoding=UTF8 -Xmx4096m -jar /var/www/emulator/Emulator/target/Habbo-4.1.15-jar-with-dependencies.jar >/var/log/emu/emulator.log
```
Please note : -Xmx4096m here we give the emulator to use 4GB of mem. you can set this to any amount you want in MB  
- 1GB = 1024
- 2GB = 2048
- 3GB = 3096
etc. etc.  
```shell
chmod +x emulator
```

Next we create the directory for the emulator log files
```shell
mkdir /var/log/emu
```

**Beware run this only ONCE !!!**  
And only use this if you imported the database as described in the CMS setup!

```mysql
mariadb
USE #yourdatabase#;
UPDATE emulator_settings SET value='0' WHERE  `key`='console.mode'
UPDATE emulator_settings SET `value` = '### PLACE HERE YOUR WEBSOCKET NAME Expl. domain.com,*domain.com,localhost,127.0.0.1' WHERE (`key` = 'websockets.whitelist');
```
So the console.mode needs to be 0
Set the whitelisted domain same as you did in the config.ini !

Next we will create the Emulator Service, so all will automaticly will start

```shell
vi /etc/systemd/system/emulator.service
```
Copy and paste the following (press **a** before pasting)
```bash
[Unit]
Description=Habbo Emulator

# make sure the Database has started before the emulator can start
After=mariadb.service
Requires=mariadb.service

# If you want to be more secure then you can change the account here, but you need to make sure you know what you are doing! as this needs access rights to the folders
[Service]
User=root
# The configuration file application.properties should be here:

#change this to your workspace
WorkingDirectory=/var/www/emulator/Emulator/target

#path to executable.
#executable is a bash script which calls jar file
ExecStart=/var/www/emulator/Emulator/target/emulator

SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Before we enable the service test the emulator by using the following cmd:
```cmd
cd /var/www/emulator/Emulator/target
java -Dfile.encoding=UTF8 -Xmx4096m -jar /var/www/emulator/Emulator/target/Habbo-4.1.15-jar-with-dependencies.jar  # Check the version !!!
```

Once it is has all started you are almost ready to go.  
Press CTRL+C to exit the emulator  
```shell
systemctl enable emulator.service
systemctl start emulator.service
```
see if all has started by using the : ```cat /var/log/emulator.log```
- To stop the emulator : ```systemctl stop emulator.service```
- To debug the log : ```tail -f /var/log/emulator.log``` <-- To end press CTRL+C

Now you can test it out by doing an reboot and see if the emulator start when rebooted:
```shell
>/var/log/emulator.log
reboot
```

# Nitro V3 / Nitro Renderer

I would recoomend to use WINSCP to edit the files as this way it is much easyer.
So connect to the VPS and go to : /var/www/Nitro-V3/public/configuration
Here rename all the .example to .json:
- client-mode.json
- hotlooks.json
- infostand_backgrounds.json
- news.json
- renderer-config.json
- ui-config.json

Now Edit the renderer-config.json to :
```json
	"socket.url": "wss://##MY DOMAIN.COM##:2096",
	"crypto.ws.enabled": false,
	"crypto.ws.signing.enabled": false,
	"crypto.ws.signing.public_key": "",
	"api.url": "https://##MY DOMAIN.COM##:2096",
    "asset.url": "https://##MY DOMAIN.COM##/gamedata",
    "image.library.url": "http://##MY DOMAIN.COM##/gamedata/c_images/",
    "hof.furni.url": "https://##MY DOMAIN.COM##",
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
    "furni.asset.icon.url": "http://##MY DOMAIN.COM##/gamedata/icons/%libname%%param%_icon.png",
    "pet.asset.url": "${asset.url}/pets/%libname%.nitro",
    "generic.asset.url": "${asset.url}/bundled/generic/%libname%.nitro",
    "room.asset.url": "${asset.url}/room/%libname%/%libname%.json",
    "badge.asset.url": "${image.library.url}album1584/%badgename%.gif",
    "badge.asset.group.url": "http://##MY DOMAIN.COM##/habbo-imaging/badge/%badgedata%",
    "badge.asset.group.external.url": "",
    "badge.asset.grouparts.url": "https://##MY DOMAIN.COM##/gamedata/badgeparts/badgepart_%part%.png",
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
	"badges.custom.texts.endpoint": "${api.url}/api/badges/custom/texts",
	"account.change-password.endpoint": "${api.url}/api/auth/change-password",
	"account.change-email.endpoint": "${api.url}/api/auth/change-email",
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
Here you can change the ##MY DOMAIN.COM## to your domain, in this case i would asume you use Cloudflare and that you made the SSL bypass rule : https://##MY DOMAIN.COM##:2096/* (and the * is required !!!)

Next step is to do the ui-config:
``` 
	"image.library.notifications.url": "${image.library.url}notifications/%image%.png",
    "achievements.images.url": "${image.library.url}Quests/%image%.png",
    "camera.url": "https://##MY DOMAIN.COM##/camera/photo",
    "thumbnails.url": "https://##MY DOMAIN.COM##/camera/photo/thumb/%thumbnail%.png",
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

Next step client-mode.json, and very important to use the wesocket adress as apiBaseUrl!:

```
{
    "distObfuscationEnabled": false,
    "secureAssetsEnabled": false,
    "secureApiEnabled": false,
    "apiBaseUrl": "https://### THE WEBSOCKET ADDRESS : MY_DOMAIM:2096###",
    "plainConfigBaseUrl": "https://###MY_DOMAIM###/configuration/",
    "plainGamedataBaseUrl": "https://###MY_DOMAIM###/gamedata/"
}
``` 
Whe this is all done we can compile the NitroV3:
```
cd /var/www/Nitro_Render
yarn install && yarn link
cd /var/www/Nitro-V3/
yarn install && yarn link "@nitrots/nitro-renderer" 
```

When all is right configured in NGINX then you would see the UI Login page.

# The websocket config

in the emulator directory there is the file config.ini here you need to cofigure the websocket settins
- `ws.enabled` - true, this will enable or disable the websocket
- `ws.host` - host ip, should leave it as 0.0.0.0
- `ws.port` - host port, can be any port but if you want to proxy wss traffic with Cloudflare read the following section
- `ws.ip.header` - header that will be used for obtaining the user's real ip address if server is behind a proxy. Will most likely be needed to be set to `X-Forwarded-For` or `CF-Connecting-IP` if behind Cloudflare.

## How do I connect to my emulator using Secure Websockets (wss)? ##
You have several options to add WSS support to your websocket server. 

- You can add your certificate and key file to the path `/ssl/cert.pem` and `/ssl/privkey.pem` to add WSS support directly to the server **Note**:The client will not accept self-signed certificates, you must use a certificate signed by a CA (you can get one for free from letsencrypt.org)
 
- or you can proxy WSS with either cloudflare or nginx. **Note**: Adding a proxy means that you will have to configure `ws.nitro.ip.header` so that the plugin is able to get the player's real ip address, and not the IP address of the proxy.

### Proxying WSS with Cloudflare
You can easily proxy wss traffic using Cloudflare. However, you should first make sure that your `ws.nitro.port` is set to one that is listed as HTTPS Cloudflare Compatible in the following link:
https://support.cloudflare.com/hc/en-us/articles/200169156-Which-ports-will-Cloudflare-work-with-

As of writing this, the following ports are listed as compatible:
- 443
- 2053
- 2083
- 2087
- 2096
- 8443

After your port is set to one that is compatible, create a new A record for a subdomain that will be used for websocket connections, and make sure that it is set to be proxied by Cloudflare (the cloud should be orange if it is being proxied). It should be pointing to your emulator IP.

Create an DNS record in Cloudflare : sockets.yourdomain.com and point this to your IP with Proxied enabled.  
Finally, create a new page rule under the Page Rules tab in Cloudflare and disable SSL for the subdomain you created above (https://example.com:2096/*).
You will now be able to connect using secure websockets using the following example url, where I created an A record for the subdomain `ws` and I set my `ws.nitro.port` to 2096: `wss://example.com:2096` 