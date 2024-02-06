# Setup Nitro and all assests relelated  

This is the last setup, so all other have already been done in order to get Nitro to work!  

## Nitro Client Setup

```shell
git clone https://git.krews.org/nitro/nitro-react.git /source/nitro
cd /source/nitro
git checkout dev
```
go to : [Config settings](https://git.krews.org/duckietm/ubuntu-tutorial/-/tree/main/Config)
Download the : ui-config.json and renderer-config.json files and save them local on your PC  
Now edit both files and replace : ###YOUR DOMAIN### with your domain name or IP, also be aware :  
- https if you are using the SSL solution described in Cloudflare_SSL setup or have an CDN / Webserver solution that supports SSL  
- in renderer-config.json use WSS when using Cloudflare or an Valid SSL on the Emulator  

Once done editing the files copy them to :/source/nitro/public useing WISCP or any other SSH file transfer tool
```shell
cd /source/nitro
npm i yarn -g
```
```shell
yarn install
```

```vi
vi /source/nitro/public/index.html
```
You need to make the index.html look like
```text
<!DOCTYPE html>
<html lang="en">
  <head>
  <title>#Your Hotelname#</title>
  <meta charset="utf-8" />
  <base href="/client/">
  <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
  <link rel="apple-touch-icon" sizes="180x180" href="%PUBLIC_URL%/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="%PUBLIC_URL%/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="%PUBLIC_URL%/favicon-16x16.png">
  <link rel="manifest" crossorigin="use-credentials" href="site.webmanifest">
  <link rel="mask-icon" href="%PUBLIC_URL%/safari-pinned-tab.svg" color="#000000">
  <meta name="apple-mobile-web-app-title" content="#Your Hotelname#">
  <meta name="application-name" content="#Your Hotelname#">
  <meta name="msapplication-TileColor" content="#000000">
  <meta name="theme-color" content="#000000" />
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root" class="w-100 h-100"></div>
    <script>
      const NitroConfig = {
        "config.urls": [ 'renderer-config.json?v=1', 'ui-config.json?v=1' ],
        "sso.ticket": (new URLSearchParams(window.location.search).get('sso') || null),
        "forward.type": (new URLSearchParams(window.location.search).get('room') ? 2 : -1),
        "forward.id": (new URLSearchParams(window.location.search).get('room') || 0),
        "friend.id": (new URLSearchParams(window.location.search).get('friend') || 0),
      };
    </script>
  </body>
</html>
````

```shell
yarn build:prod
```
```shell
cd /source/nitro/build
mkdir /var/www/Client
cp -r * /var/www//Client
vi /var/www/atomcms/.env
```
in the editor edit the : ```NITRO_CLIENT_PATH``` to look like:
```ini
NITRO_CLIENT_PATH=/client
```

```shell
mkdir /var/www/Gamedata/effect
mkdir /var/www/Gamedata/clothes
mkdir /var/www/Gamedata/furniture
mkdir /var/www/Gamedata/pets
mkdir /var/www/Gamedata/icons
mkdir /var/www/Gamedata/sounds
mkdir /var/www/Gamedata/c_images/
mkdir /var/www/Gamedata/c_images/catalogue
```

If you got the [The All 1 one Nitro Converter](https://git.krews.org/duckietm/converter)
You can copy over the following:
- C:\tools\Convert\assets\bundled\effect --> /var/www/Gamedata/effect
- C:\tools\Convert\assets\bundled\figure --> /var/www/Gamedata/clothes
- C:\tools\Convert\assets\bundled\furniture --> /var/www/Gamedata/furniture
- C:\tools\Convert\assets\bundled\pets --> /var/www/Gamedata/pets
- C:\tools\Convert\assets\bundled\Furni_Icons  --> /var/www/Gamedata/icons
- C:\tools\DownloadHabbo\mp3  --> /var/www/Gamedata/sounds
- C:\tools\DownloadHabbo\badges  --> /var/www/Gamedata/c_images/album1584
- [Default asstes] Add-ons/default_gamedata.zip --> /var/www/retrohotel/Gamedata/

# Setup the websocket

## How do I configure the plugin?
Startup the plugin so it generates the required entries under your `emulator_settings` table. The following fields will be generated:
- `websockets.whitelist` - a comma-delimited list containing all permitted Origin headers. You should write the domain name of your hotel here, since the Websocket connection will be initiated there. Wildcards are also supported, so you can whitelist all subdomains by adding for example: `*.example.com`, or even whitelist all origins by adding `*` (not recommended)
- `ws.nitro.host` - host ip, should leave it as 0.0.0.0
- `ws.nitro.port` - host port, can be any port but if you want to proxy wss traffic with Cloudflare read the following section
- `ws.nitro.ip.header` - header that will be used for obtaining the user's real ip address if server is behind a proxy. Will most likely be needed to be set to `X-Forwarded-For` or `CF-Connecting-IP` if behind Cloudflare.

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
Finally, create a new page rule under the Page Rules tab in Cloudflare and disable SSL for the subdomain you created above. You will now be able to connect using secure websockets using the following example url, where I created an A record for the subdomain `ws` and I set my `ws.nitro.port` to 2096: `wss://sockets.example.com:2096` 

## FAQS ##
**I am getting the error `Unable to load ssl: File does not contain valid private key: ssl\privkey.pem`**

Make sure your private key is in PKCS#8 format. You can convert it to PKCS8 format with the following command:
```
openssl pkcs8 -topk8 -nocrypt -in yourkey.pem -out yournewkey.pem
```


**I am getting disconnected from the client with no error logs**

Make sure your sso ticket is valid and that you didn't do an IP ban before configuring the `ws.nitro.ip.header` if you're behind a proxy.

# Last part make the Virtual Directories

```vi /etc/nginx/sites-available/cms.conf```

and add make it the folowing (this needs to be added so not copy and paste) after the :
```
location / {
        try_files $uri $uri/ /index.php?$query_string;
        autoindex off;
        }
```
Paste:
```
        location /client {
        limit_conn addr 10;
        alias /var/www/atomcms/Client;
        autoindex off;
        }

        location /gamedata {
        alias /var/www/atomcms/Gamedata;
        access_log off;
        autoindex off;
        }
```

To debug open Chrome and press F12, in the debug menu select console 
for example : ```WebSocket connection to 'wss://sockets.yourdmain.com:2096/' failed: ``` there is an error connecting to the websocket.  
Check your firewall / dns setting etc. etc.
Or : ```Error while trying to use the following icon from the Manifest: https://yourdomain.com/gamedata/c_images/album1584/ADM.gif (Download error or resource isn't a valid image)``` this means you are missing an image  
So always check this before posting errors !
