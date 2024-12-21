# Setup the Nitro Imager, this will render all the avatars from your reposotory  
Before continue make sure you have the CMS installed and verify that it is running  

## Nitro Imager with Node V20

Copy the content to example : /docker/nitro_imager you will find this in the Docker folder

Change the /docker/nitro_imager/.env

Let say your content is (clothes & config) in :/var/www/XXX/XXX/XXX then change the path in the .env file
But if you host your CMS on a other server you can replace the absoulte path with url paths as well.

Example :
```env
API_HOST=habbo_imager
API_PORT=3030
AVATAR_SAVE_PATH=/src/saved_figure
AVATAR_ACTIONS_URL=/var/www/Gamedata/config/HabboAvatarActions.json
AVATAR_FIGUREDATA_URL=/var/www/Gamedata/config/FigureData.json
AVATAR_FIGUREMAP_URL=/var/www/Gamedata/config/FigureMap.json
AVATAR_EFFECTMAP_URL=/var/Gamedata/config/EffectMap.json
AVATAR_ASSET_URL=/var/www/Gamedata/clothes/%libname%.nitro
```
Next make the path avalibe in /docker/nitro_imager/docker-compose.yml

Example:

```yml
services:
  node:
    image: node:20.18.1
    container_name: habbo_imager
    working_dir: /src
    ports:
      - "3030:3030" # Maps port 3000 of the host to port 3000 of the container
    stdin_open: true # Keeps the container open to accept input
    tty: true        # Enables an interactive terminal
    # command: sh -c "yarn start"
    networks:
      frontend:
        ipv4_address: 172.38.0.2

    environment:
      - YARN_CACHE_FOLDER=/src/app/.yarn-cache # Optional: Set cache folder inside the app directory

    volumes:
      - ./imager:/src
      - /var/www:/var/www

networks:
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.38.0.0/24
          gateway: 172.38.0.1
```
Now you can run : docker-compose up -d 
Next we need to connect to the imager to compile the source
```cmd
docker exec -it habbo_imager bash
```
This will connect to the docker and we can do the following commands:
```cmd
yarn install && yarn build
```
Now test the build in the console:
```cmd
yarn start
```
It should show the following output:
```text
 [Nitro] Starting Nitro Imager
 [Nitro] Loading: /var/www/Gamedata/clothes/hh_human_body.nitro
 [Nitro] Loading: /var/www/Gamedata/clothes/hh_human_item.nitro
 [Nitro] Loading: /var/www/Gamedata/effect/Dance1.nitro
 [Nitro] Loading: /var/www/Gamedata/effect/Dance2.nitro
 [Nitro] Loading: /var/www/Gamedata/effect/Dance3.nitro
 [Nitro] Loading: /var/www/Gamedata/effect/Dance4.nitro
 [Nitro] Server Started habbo_imager:3030
```
We now have a good working imager, so now press CTRL+C and type exit.
This will take us out of the console and back to the shh shell of the server.
Next stop the docker : ```docker compose stop```
Now edit the docker-compose.yml and uncomment the following:
```text
    tty: true        # Enables an interactive terminal
    command: sh -c "yarn start"   # Start the imager  
    networks:
```
you can check if all has started as it should by looking at the logs : ```docker logs habbo_imager```

Next to use it use the following in nginx:
```yml
location /imaging/ {
        proxy_pass http://172.38.0.2:3030;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
```

* Don't forget your firewall not to allow access from outside.
* if you have nginx setup and the docker is running, you can test it by using the follwing URL : https://##YOUR DOMAIN##/imaging/?figure=ha-1003-88.lg-285-89.ch-3032-1334-109.sh-3016-110.hd-180-1359.ca-3225-110-62.wa-3264-62-62.hr-891-1342.0;action=std&gesture=sml&direction=2&head_direction=2amp;img_format=png&gesture=srp&headonly=1&size=l

# Setup the Webproxy

add the following before location ~ \.php$ {
```vi /etc/nginx/sites-available/cms.conf```
paste :
```
 location /imaging/ {
        proxy_pass http://172.38.0.2:3031;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
```

# Setup Gamedata  

We now need to get all the gamedata setup, for this we need .nitro files and .json file's  
You can transfer all your gamedata for your own recourse or download them with the Downloader tool and also add the Nitro default assets  
- Downloader tool : https://git.krews.org/duckietm/converter
- Nitro default assets : https://git.krews.org/nitro/default-assets  

After done downloading / converting etc. etc.  
We need for the Imager to work the following folders with the files in /var/www/retrohotel/Gamedata  (Please be aware the Linux is case sensitive so don't mistake with captials or no capitals)  

```shell
mkdir /var/www/retrohotel/Gamedata/effect
mkdir /var/www/retrohotel/Gamedata/clothes
mkdir /var/www/retrohotel/Gamedata/config
```

* effect <-- C:\Tools\Convert\assets\bundled\effect
* clothes <-- C:\Tools\Convert\assets\bundled\figure
* config  <-- C:\Tools\Convert\assets\gamedata
* config  <-- https://git.krews.org/nitro/default-assets/-/tree/master/gamedata/HabboAvatarActions.json (Copy this file in this dir)  

You can use WINSCP or any other tool that can transfer files to the Linux server  
