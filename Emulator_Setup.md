# Setup the Arcturus Morningstar emulator  

Before continue make sure you have the CMS installed and verify that it is running.  

download : Emulator_Compiled or use the the latest version  version from : [Arcturus Morningstar](https://git.krews.org/morningstar/Arcturus-Community/-/tree/dev) <-- This is the recommended way compile the latest emulator yourself!

For this you can find more info on the main site : [Arcturus Morningstar](https://git.krews.org/morningstar/Arcturus-Community/-/tree/master) and on Discord : [discord](https://discord.gg/BzfFsTp)  

```shell
dpkg-reconfigure tzdata
```
Now set your timezone in this menu and write this down.  
In my case : ```Current default time zone: 'Europe/Amsterdam' ```

```shell
mkdir /var/www/Emulator
apt install default-jre -y
```
Copy the following to the /var/www/Emulator using WINSCP or any other tool, this is in the emulator.zip (or ofcourse upoad your own Emu that is prefert)
```dir
plugins <-- Direcory
config.ini
emulator_28032022.jar
```  

Edit the config.ini to the following:
```shell
cd /var/www/Emulator
vi config.ini
```
```ini
#Database Configuration.
db.hostname=127.0.0.1
db.port=3306
db.database=#### Your Database Name ####
db.username=#### Your Database Username ####
db.password=#### Your Database Password ####
db.params=?characterEncoding=utf8&useSSL=false&serverTimezone=Europe/Amsterdam ## Set your timezone beware Use capitals like in the example 
db.pool.minsize=5
db.pool.maxsize=350

#Game Configuration.
game.host=0.0.0.0
#game.port=7012
game.port=3000

#RCON Configuration.
rcon.host=0.0.0.0
rcon.port=3001
rcon.allowed=127.0.0.1

encryption.forced=true
#Encryption for your Hotel Only Use it if you know WTF you doin'.
enc.enabled=false
enc.e=3
enc.n=86851dd364d5c5cece3c883171cc6ddc5760779b992482bd1e20dd296888df91b33b936a7b93f06d29e8870f703a216257dec7c81de0058fea4cc5116f75e6efc4e9113513e45357dc3fd43d4efab5963ef178b78bd61e81a14c603b24c8bcce0a12230b320045498edc29282ff0603bc7b7dae8fc1b05b52b2f301a9dc783b7
enc.d=59ae13e243392e89ded305764bdd9e92e4eafa67bb6dac7e1415e8c645b0950bccd26246fd0d4af37145af5fa026c0ec3a94853013eaae5ff1888360f4f9449ee023762ec195dff3f30ca0b08b8c947e3859877b5d7dced5c8715c58b53740b84e11fbc71349a27c31745fcefeeea57cff291099205e230e0c7c27e8e1c0512b
``` 
to save type ":wq!"   <-- no quotes
```shell
vi emulator
```
paste the following (press **a** before pasting)
```
#!/bin/sh
java -Dfile.encoding=UTF8 -Xmx4096m -jar /var/www/Emulator/emulator_28032022.jar >/var/log/emulator.log
```
Please note : -Xmx4096m here we give the emulator to use 4GB of mem. you can set this to any amount you want in MB  
- 1GB = 1024
- 2GB = 2048
- 3GB = 3096
etc. etc.  
```shell
chmod +x emulator
```
**Beware run this only ONCE !!!**  
And only use this if you imported the database as described in the CMS setup!

```mysql
mariadb
USE #yourdatabase#;
UPDATE emulator_settings SET value='0' WHERE  `key`='console.mode';
```
So the console.mode needs to be 0  

```shell
vi /etc/systemd/system/emulator.service
```
Copy and paste the following (press **a** before pasting)
```bash
[Unit]
Description=Morningstar Emulator
# make sure the Database has started before the emulator can start
After=mariadb.service
Requires=mariadb.service

[Service]
User=root
# The configuration file application.properties should be here:

#change this to your workspace
WorkingDirectory=/var/www/Emulator

#path to executable.
#executable is a bash script which calls jar file
ExecStart=/var/www/Emulator/emulator

SuccessExitStatus=143
TimeoutStopSec=10
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```  
to save type ":wq!"   <-- no quotes

Before we enable the service test the emulator by using the following cmd:
```cmd
java -Dfile.encoding=UTF8 -Xmx4096m -jar /var/www/Emulator/emulator_28032022.jar
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

That is all folks your Emulator is up and running !!!  

Recourses :

- Emulator (https://git.krews.org/morningstar/Arcturus-Community/-/tree/dev)
- Nitro Websocket (https://git.krews.org/nitro/ms-websockets)
