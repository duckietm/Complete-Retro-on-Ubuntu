# VPS Setup — Ubuntu Server, NGINX and MariaDB

Install a fresh copy of **Ubuntu Server 26.04 LTS** (codename *Resolute Raccoon*, the current stable LTS release) on your VPS, or use it under Windows via WSL.

More info on installing WSL on Windows: <https://learn.microsoft.com/en-us/windows/wsl/install>

For running a retro hotel, Linux is strongly recommended over Windows:

- 🌎 **NGINX is built for Linux.** A Windows port exists, but performance suffers because of the file system.
- 🐧 **Docker support.** Easily run helpers like a Habbo imager; busy hotels can sit behind NGINX Proxy Manager.
- 👊 **Better service management.** Morningstar (and other emulators) integrate cleanly with `systemd`.
- 🚤 **Higher performance.** Especially for the CMS and PHP-FPM workload.
- 🙌 **Open source.** Tons of resources for tuning the kernel and TCP stack.
- 💶 **No Windows license required.**

> **CDN reminder:** always put your hotel behind a CDN (Cloudflare, Akamai, Fastly, etc.). Start with Cloudflare's free tier. Once you're past ~50 online users, consider Cloudflare Pro or another tier that matches your needs. **Do NOT use Cloudflare Zero Trust as your only protection** — it doesn't protect you when combined with the Cloudflare Proxy option. Zero Trust is fine for home use (NAS, Home Assistant) but not for production hotels.

## What we'll install

- **NGINX** — high-performance web server (mainline build)
- **MariaDB 11.8** — current stable, latest tables compatible
- **PHP 8.4 (FPM)** — current stable; bump to 8.5 once it's GA in `ondrej/php`
- **Composer + Node.js 24 + Yarn** — for AtomCMS/OrionCMS
- Foundation for AtomCMS, OrionCMS, or the built-in Nitro UI login (no CMS required)

You'll also need these tools on your local machine:

- 📺 **SSH client** — [MobaXterm](https://mobaxterm.mobatek.net/download.html) (free, recommended)
- 📺 **MySQL client** — [HeidiSQL](https://www.heidisql.com/) (free; don't use cracked Navicat — many cracked copies ship with malware)
- 📺 **File transfer** — [WinSCP](https://winscp.net/eng/download.php)

## Install NGINX

```bash
apt install -y curl gnupg2 ca-certificates lsb-release dirmngr software-properties-common apt-transport-https
```
```bash
curl -fsSL https://nginx.org/keys/nginx_signing.key \
  | gpg --dearmor \
  | tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null
```
```bash
gpg --dry-run --quiet --import --import-options import-show \
  /usr/share/keyrings/nginx-archive-keyring.gpg
```
```bash
echo "deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/mainline/ubuntu `lsb_release -cs` nginx" \
  | tee /etc/apt/sources.list.d/nginx.list
```
```bash
echo -e "Package: *\nPin: origin nginx.org\nPin: release o=nginx\nPin-Priority: 900\n" \
  | tee /etc/apt/preferences.d/99nginx
```
```bash
apt update -y
apt install -y nginx
apt install -y nginx-common
chmod +x /etc/init.d/nginx
```

If any pop-up screens appear, just press **OK**, also do them section by section!

## Install PHP-FPM 8.4

```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt install -y \
  php8.4-fpm php8.4 php8.4-common php8.4-mysql \
  php8.4-xml php8.4-xmlrpc php8.4-curl php8.4-gd \
  php8.4-imagick php8.4-cli php8.4-imap php8.4-mbstring \
  php8.4-soap php8.4-zip php8.4-intl php8.4-bcmath unzip
```

If any pop-up screens appear, just press **OK**.

## Install MariaDB 11.8

```bash
apt-get install -y apt-transport-https curl
mkdir -p /etc/apt/keyrings
curl -o /etc/apt/keyrings/mariadb-keyring.pgp \
  'https://mariadb.org/mariadb_release_signing_key.pgp'
```

Create the MariaDB sources list:

```bash
vi /etc/apt/sources.list.d/mariadb.sources
```

Press `i` to enter insert mode (you'll see `-- INSERT --` in the bottom-left), then paste:

```ini
# MariaDB 11.8 repository list
# https://mariadb.org/download/
X-Repolib-Name: MariaDB
Types: deb
URIs: https://ftp.nluug.nl/db/mariadb/repo/11.8/ubuntu
Suites: noble
Components: main main/debug
Signed-By: /etc/apt/keyrings/mariadb-keyring.pgp
```

> **Note on the `Suites:` line:** MariaDB's repo currently publishes for `noble` (Ubuntu 24.04). At the time of writing, no `resolute` (Ubuntu 26.04) suite is published yet — the `noble` packages run on 26.04 without issue. Once MariaDB publishes a 26.04 suite, switch this line to match.

Press `ESC`, then type `:wq` and press Enter. Then install:

```bash
apt-get update -y
apt-get install -y mariadb-server
```

## Install Composer + Node.js + Yarn

```bash
sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg

curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
  | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

NODE_MAJOR=24
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" \
  | tee /etc/apt/sources.list.d/nodesource.list

sudo apt-get update && sudo apt-get install -y nodejs

curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php
sudo php /tmp/composer-setup.php --install-dir=/usr/bin --filename=composer

npm install --global yarn
```

## SSH security (key-based authentication)

First, we'll secure the server by disabling password login and switching to SSH key authentication. The same key can be used to tunnel into the database, so port 3306 never has to be exposed — only SSH needs to be reachable from the internet. This is far more secure and easier to maintain.

### Step 1 — Generate the key pair

In MobaXterm, open the **Tools** menu (top of the window) → **MobaKeyGen (SSH Key generator)**.

Click **Generate** and move your mouse until the bar fills.

Copy the entire **public key text** from the top box and save it to a file on your PC, e.g. `C:\Key\Public.key`. Do **not** click "Save public key" — it saves a slightly different format that won't work. Just copy-paste the text.

The text looks like this *(this is an example — never use someone else's key!)*:

```text
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDJXTjI5gozMN8XmFwIdC76h8zv/tDc5l5kLNdaplEgpRtcrVj+...== rsa-key-20230711
```

Enter the same password in both **"Key passphrase"** and **"Confirm passphrase"**. **This is critical** — losing this passphrase means losing access.

Click **Save private key** and store it next to the public key as `C:\Key\Privatekey.ppk`.

### Step 2 — Install the public key on the server

Log into your VPS as root and run:

```bash
mkdir -p /root/.ssh
chmod 700 /root/.ssh
vi /root/.ssh/authorized_keys
```

Press `i`, paste the **public key** text, press `ESC`, then `:wq`.

Lock the file down and restart SSH:

```bash
chmod 600 /root/.ssh/authorized_keys
service ssh restart
```

### Step 3 — Test the key BEFORE locking down passwords

> **Do not skip this step.** If you disable password login before confirming the key works, you can lock yourself out.

In MobaXterm, right-click your current session → **Duplicate session** → **Edit settings** → **Advanced SSH settings** → enable **Use private key** and select `C:\Key\Privatekey.ppk`. Click OK.

Connect with the duplicated session. Username is `root`. When prompted for a password, enter the **passphrase you set on the key** — not the server's root password. If it connects, you're good.

### Step 4 — Disable password authentication

In your new key-based session:

```bash
> /etc/ssh/sshd_config       # truncates the file to empty
vi /etc/ssh/sshd_config
```

Press `i` and paste:

```ini
Include /etc/ssh/sshd_config.d/*.conf
Port 22
PermitRootLogin prohibit-password
PasswordAuthentication no
PubkeyAuthentication yes
KbdInteractiveAuthentication no
UsePAM yes
X11Forwarding yes
PrintMotd no
AcceptEnv LANG LC_*
Subsystem       sftp    /usr/lib/openssh/sftp-server
```

Press `ESC`, then `:wq`.

> **About `PermitRootLogin prohibit-password`:** allows root to log in by SSH key but blocks any password-based login. Stronger than `yes`, less restrictive than `no` (which would block root entirely and force a non-root user with `sudo`). If you want maximum security, set up a non-root user with `sudo` and use `PermitRootLogin no`.

Reboot:

```bash
reboot
```

> **Back up your keys!** Save both `Public.key` and `Privatekey.ppk` somewhere safe (encrypted USB, password manager, etc.). If you lose them, your only way back into the server is through your provider's VNC/KVM console.

## Database setup

Finalize the MariaDB install:

```bash
mariadb-secure-installation
```

Answer the prompts as follows:

```text
Enter current password for root (enter for none):   <-- Press ENTER
Switch to unix_socket authentication [Y/n]            <-- Press n
Change the root password? [Y/n]                       <-- Press n
Remove anonymous users? [Y/n]                         <-- Press Y
Disallow root login remotely? [Y/n]                   <-- Press n
Remove test database and access to it? [Y/n]          <-- Press Y
Reload privilege tables now? [Y/n]                    <-- Press Y
```

> **Security note on `bind-address`:** the snippet below leaves MariaDB listening on `127.0.0.1` (localhost only). This is the safest default — the database is **not** exposed to the internet. You connect to it through an SSH tunnel from your local machine (see HeidiSQL config below). **Only change `bind-address` to `0.0.0.0` if you have a hard firewall rule blocking port 3306 from the outside world**, otherwise you're inviting brute-force attacks.

```bash
vi /etc/mysql/mariadb.conf.d/50-server.cnf
```

Confirm this line is set (it's the default):

```ini
bind-address            = 127.0.0.1
```

Now create the database and users. Replace the placeholder passwords with strong values:

```bash
mariadb
```

```sql
-- Root user, localhost only
CREATE USER 'root'@'localhost' IDENTIFIED BY 'CHANGE_THIS_TO_A_STRONG_ROOT_PASSWORD';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;

-- CMS application user, localhost only
CREATE USER 'cms'@'localhost' IDENTIFIED BY 'CHANGE_THIS_TO_A_STRONG_CMS_PASSWORD';

-- Hotel database
CREATE SCHEMA `habbo`;
GRANT EXECUTE, SELECT, SHOW VIEW, ALTER, ALTER ROUTINE,
      CREATE, CREATE ROUTINE, CREATE TEMPORARY TABLES, CREATE VIEW,
      DELETE, DROP, EVENT, INDEX, INSERT, REFERENCES, TRIGGER,
      UPDATE, LOCK TABLES
ON `habbo`.* TO 'cms'@'localhost';

FLUSH PRIVILEGES;
EXIT;
```

> **Tip:** if you need to connect from your local machine (for HeidiSQL), use an **SSH tunnel** — don't expose port 3306. The tunnel runs over your existing SSH key, so no extra port has to be opened.

Reboot to make sure everything is clean:

```bash
reboot
```

You can now connect to the database via HeidiSQL using your SSH key. A detailed walkthrough is here: <https://www.enovision.net/mysql-ssh-tunnel-heidisql>

## Next steps — import the base database

Once connected, import the base Arcturus / Morningstar Extended database. The recommended source is the **Arcturus-Morningstar-Extended** repository, which ships an `ms4db-all-init.sql` (or equivalent) base file:

> **TODO:** add a direct link to the base SQL file once the repo location is finalised.

After the import is in place, continue with the [NitroV3 & Emulator Setup](NitroV3_And_Emulator.md).
