# VPS SETUP with UBUNTU Server / NGINX and MariaDB

Install a fresh copy of Ubuntu Server (24.04 is the current stable release and will be used) on your VPS/Server or use it on your Windows (WSL)

More info on how to install WSL on Windows can be found here: https://learn.microsoft.com/en-us/windows/wsl/install For running a Retro hotel I do recommend using a Linux operating system as this has more advantages than the Windows platform. Example :

:earth_americas: NGINX is built for Linux systems and has been ported to Windows but will perform less due to the file system.

:penguin: Running Linux dockers to add functions like the habbo imager, on busy hotels they can use NGINX Proxy manager

:punch: Better support for running Morningstar or any other emulator as a Linux service

:speedboat: We see much better performance on Linux than on Windows, especially the CMS

:open_hands: Opensource, so there are many more resources available to tune the Kernel / TCP Stack.

:euro: And ofcourse cheaper as we do not need a windows license!

Always keep in mind to use a CDN (Cloudflare / Akamai / Fastly and many more), we advise you to start with Cloudflare and use the Free version to start. When your hotel is >50 users online then start thinking about Cloudflare Pro or a better fit to your needs. Some advise never to use the "Cloudflare Zero Trust" option to reach your VPS, as this will NOT protect you when using the Cloudflare Proxy option. This is however a nice feature, but this is for a Home NAS / Application like Home Assist etc. but never for a production system!

We will be installing the following on the system.

:point_right: NGINX (high-performance webserver)

:point_right: MariaDB 11.0 latest stable version, look in the FAQ of the Krews DC to update the tables to use MariaDB 11

:point_right: Setup the infra for AtomCMS

:point_right: The following is a requirement on your local laptop/desktop:

:vhs: SSH client, for this I do recommend MobaXterm https://mobaxterm.mobatek.net/download.html this is a free version

:vhs: MySQL Workbench, for this I recommend using Heidi (make it yourself easy don't use a pirated copy of Navicat, this is just bad software and a lot of cracked versions come with spyware) https://www.heidisql.com/

:vhs: WinSCP, a free tool to quickly transfer files from your machine to the server https://winscp.net/eng/download.php

## NGINX
```
apt install curl gnupg2 ca-certificates lsb-release dirmngr software-properties-common apt-transport-https -y
curl -fSsL https://nginx.org/keys/nginx_signing.key | gpg --dearmor | tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null
gpg --dry-run --quiet --import --import-options import-show /usr/share/keyrings/nginx-archive-keyring.gpg
echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/mainline/ubuntu `lsb_release -cs` nginx" | tee /etc/apt/sources.list.d/nginx.list
echo -e "Package: *\nPin: origin nginx.org\nPin: release o=nginx\nPin-Priority: 900\n" | tee /etc/apt/preferences.d/99nginx
apt update -y
apt install nginx-common -y
apt install nginx -y
```

When there are popup screens just press OK :white_square_button:

## NGINX PHP-FPM 8.3
```
sudo add-apt-repository ppa:ondrej/php -y
sudo apt install php8.3-fpm php8.3 php8.3-common php8.3-mysql php8.3-xml php8.3-xmlrpc php8.3-curl php8.3-gd php8.3-imagick php8.3-cli php8.3-imap php8.3-mbstring php8.3-opcache php8.3-soap php8.3-zip php8.3-intl php8.3-bcmath unzip -y
```
When there are popup screens just press OK :white_square_button:

## MariaDB
```
apt-get install apt-transport-https curl -y
mkdir -p /etc/apt/keyrings
curl -o /etc/apt/keyrings/mariadb-keyring.pgp 'https://mariadb.org/mariadb_release_signing_key.pgp'
```
When there are popup screens just press OK :white_square_button:

create the following file: vi /etc/apt/sources.list.d/mariadb.sources (First press the letter i before paste you will the see in the left corner the text -- INSERT --)
```
# MariaDB 11.8 repository list - created 2025-08-01 12:32 UTC
# https://mariadb.org/download/
X-Repolib-Name: MariaDB
Types: deb
# deb.mariadb.org is a dynamic mirror if your preferred mirror goes offline. See https://mariadb.org/mirrorbits/ for details.
# URIs: https://deb.mariadb.org/11.8/ubuntu
URIs: https://ftp.nluug.nl/db/mariadb/repo/11.8/ubuntu
Suites: noble
Components: main main/debug
Signed-By: /etc/apt/keyrings/mariadb-keyring.pgp
```
When pasted press [ESC] then type :wq <-- make sure that there are no capitals
```
apt-get update -y
apt-get install mariadb-server -y
```
Composer and NodeJS
```
sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt-get update && sudo apt-get install nodejs -y

curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php
sudo php /tmp/composer-setup.php --install-dir=/usr/bin --filename=composer
```
When there are popup screens just press OK :white_square_button:

Setup Database and secure your server

## SSH Security
First, we want to secure the server by removing password authentication and using KEY authentication with your own password.
We will also use the same key to get connected to the Database, this way only the SSH port needs to be open to the internet and port 3306 will not be needed.
Therefore way more secure and also much better to maintain, by just adding a key the user will get access.

### Step 1 :
Open MobaXterm

In the window select Tools (this is on top in the menu section)

Select "MobaKeyGen (SSH Key generator)"

Select Generate <-- Move your mouse until the generate is complete

Copy the content of the key to a file on your PC/Laptop example (don't press the Save public key this will not work!) create a file C:\Key\Public.key and then paste the content.

(like this below,. SO DO NOT USE THIS !!!)
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDJXTjI5gozMN8XmFwIdC76h8zv/tDc5l5kLNdaplEgpRtcrVj+zJZ1/IT/L1gUWGZbrat/UoCD0eIdXi5o7GwXrBszkIoQA26GN5MNmvZU/JQSWDwfaXzCI1rYnZxXCXf+eRThBfdW8rHzXEiG9bvsq9ppz7T75pB5Pv6Qem/lzuiUm3wbvh4wpCkMkBDLepyAXOBGu4T+sARCPkoW4In4fP1pMzzkRqMhXCLnFPhqY692kSsChXbeIeuVls5iBnf55jM5ZJKIOFebdxZNoSkb4/nq7VepzrByWeoYcjfZM8/ZjZ0EBd8DmFgpTD0AQBqwc3oZUo+sikyFoFUDkJNp rsa-key-20230711
```
Enter a password in "Key passphrase" and the same password in "Confirm passphrase" <-- VERY IMPORTANT

Press the "Save private key" button and save this in the same location as the public.key c:\Key\Privatekey.pkk

Login to Your VPS/Server and we are going to set the SSH key, I will set it as root user this can of course can also be done for normal user accounts

### Step 2 :
```vi /root/.ssh/authorized_keys```
Paste the content of the Public.key into the editor (First press the letter i before pasting you will see in the left corner the text -- INSERT --)

When pasted press [ESC] then type :wq <-- make sure that there are no capitals

run the following command: ```service ssh restart```

### Step 3 :
Now we will test the use of the SSHkey before we make the SSH secure as we do not want to lose access to the server :)
Open the MobaXterm and duplicate your current server so you get a copy of the server.
Now edit the settings by right click the newly copied and selecting "Edit settings" In the Session settings screen now select "Advanced SSH settings" and enable "Use Private key" After this, you can select the file "C:\Key\Privatekey.pkk" in the "Use private key" field When you have selected it press OK :white_square_button:

Now use the newly copied object that will connect to your server using the SSHKey, you will be prompted for username "root" and password "
This is the password that you have set in the generate of the key so not the server password" When this is connected then all went well if not you did something wrong and need fixing before continuing.

### Step 4 :
Connect now with your newly created SSH session and use the Key (remove the old one!)

```
>/etc/ssh/sshd_config
vi /etc/ssh/sshd_config 
```
paste the following into the sshd_config (First press the letter i before pasting you will see in the left corner the text -- INSERT --)
```
Include /etc/ssh/sshd_config.d/*.conf
Port 22
PermitRootLogin yes
PasswordAuthentication no
PubkeyAuthentication yes
KbdInteractiveAuthentication no
UsePAM yes
X11Forwarding yes
PrintMotd no
AcceptEnv LANG LC_*
Subsystem       sftp    /usr/lib/openssh/sftp-server
```
When pasted press [ESC] then type :wq <-- make sure that there are no capitals

now reboot the server by the command: reboot And always make a backup of both keys in a secure place, because if you lose the keys there is no way to get access remote to the server !!! Your only option then is by using a VNC / Terminal / KVM etc.

## Database setup
First, we need to finalize the setup of MariaDB.
```
mariadb-secure-installation
Enter current password for root (enter for none):   <---- Press ENTER
Switch to unix_socket authentication [Y/n] n  <---- Press n
Change the root password? [Y/n] n  <---- Press n
Remove anonymous users? [Y/n] Y  <---- Press Y
Disallow root login remotely? [Y/n] n  <---- Press n
Remove test database and access to it? [Y/n] Y  <---- Press Y
Reload privilege tables now? [Y/n] Y  <---- Press Y
```
now we need to allow connections to the Database:

```vi /etc/mysql/mariadb.conf.d/50-server.cnf```
Edit the following setting (First press the letter i before editing you will see in the left corner the text -- INSERT --):

bind-address            = 127.0.0.1
Change this to:

bind-address            = 0.0.0.0

Now we are able to connect from anywhere, but keep in mind only with SSH so it is not a direct connection over port 3306

We now need to add a root user and CMS user to the database, and for the CMS user, we will use the database name habbo (you can change this whatever you want of course!). Also, change the password to whatever you like.

Run the following command:

mariadb
Now paste the following SQL (after changing the passwords!)

```
CREATE USER 'root'@'%' IDENTIFIED BY 'CHANGE THIS TO YOUR DB ROOT PASSWORD';
CREATE USER 'cms'@'%' IDENTIFIED BY 'CHANGE THIS TO YOUR DB CMS PASSWORD';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
CREATE SCHEMA `habbo` ; # This is the database
GRANT EXECUTE, SELECT, SHOW VIEW, ALTER, ALTER ROUTINE, CREATE, CREATE ROUTINE, CREATE TEMPORARY TABLES, CREATE VIEW, DELETE, DROP, EVENT, INDEX, INSERT, REFERENCES, TRIGGER, UPDATE, LOCK TABLES  ON `habbo`.* TO 'cms'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```
To make sure all is ready to go run: reboot

You are now able to connect to the Database using your SSH-Key with the use of HeidiSQL, how to set this up using the following link: https://www.enovision.net/mysql-ssh-tunnel-heidisql here it is in detail explained how to connect

You can now import the Database from ARC or any other one you like expl: https://git.krews.org/morningstar/ms4-base-database/-/releases <== ms4db-all-init.sql
