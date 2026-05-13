# Install Nitro-V3 

## Folder structure that we recomend

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