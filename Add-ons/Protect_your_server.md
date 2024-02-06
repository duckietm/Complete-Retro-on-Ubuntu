# Secure your ubuntu server using the UFW Firewall  

```
vi /etc/default/ufw
```
Then make sure the value of IPV6 is set to yes. It should look like this: ```IPV6=yes```

To set the default UFW incoming policy to deny, run:
```shell
ufw default deny incoming
```
To set the default UFW outgoing policy to allow, run:
```shell
ufw default allow outgoing
```
ufw limit ssh comment 'Rate limit for openssh server'
```shell
ufw limit ssh comment 'Rate limit for openssh server'
ufw enable
```
This is the default setup for ubuntu so that only ssh is allowed with rate limiting

Next is the Webserver, if you just want any connection then you use:
```
ufw allow https
```
Or when you only want Cloudflare to connect to your webserver.
We will create an cronjob

```shell
mkdir /var/scripts
vi /var/scripts/CloudFlare_ufw.sh
```
```text
#!/bin/sh
curl -s https://www.cloudflare.com/ips-v4 -o /tmp/cf_ips
echo "" >> /tmp/cf_ips
curl -s https://www.cloudflare.com/ips-v6 >> /tmp/cf_ips
for cfip in `cat /tmp/cf_ips`; do ufw allow proto tcp from $cfip comment 'Cloudflare IP'; done
ufw reload > /dev/null
```
```shell
chmod +x /var/scripts/CloudFlare_ufw.sh
crontab -e
```
and add the following line at the end
```
0 0 * * 1 /var/scripts/CloudFlare_ufw.sh > /dev/null 2>&1
```
Now run :
```shell
/var/scripts/CloudFlare_ufw.sh
```
Now your server is setup with SSH and Webrules.  
If you do not use Cloudflare for the websocket or in general you need to add the websocket or gameport firewall rule as well.
So only if you do not use Cloudflare websocket!
```shell
ufw allow 2096/tcp
```
Asuming that you use port 2096 as your websocket or gameport, if not change it :)  

When you also connect to your sever using any kind of remote MySQL/MariaDB tools you also need to add an firewall rule to remotely manage your database.

```shell
ufw allow from {YOUR IP} to any port 3306
```
This will block any unwanted guests to your database, you just need to find out your IP and add this to the rule.  
I would stronly advise you never to open your MySQL port for the whole world, as this can easly be hacked by using brute force!  
So never ever do : ```ufw allow 3306/tcp``` !!!!

The same goes for the Litespeed GUI :
```shell
ufw allow from {YOUR IP} to any port 7080
```

## Troubleshoot 

- ```ufw status``` will show you all the firewall rules.
- ```ufw show added``` will show you all the firewall rules as an script (easy for copy and paste).
- ```tail -f /var/log/ufw.log``` realtime traffic and this will give you all insight what is beeing blocked.
- Procedure to list and delete UFW firewall rules  
1. Log in to server using the ssh  
2. Display ufw firewall rules, run: sudo ufw status numbered  
3. Remove a ufw firewall rule by rule number # 3: ```sudo ufw delete 3```  <-- this is an example of delete rule number 3  
or  
Another option to erase a firewall rule is to run: ```sudo ufw delete allow 22/tcp```


# Fix your TCP Stack

```shell
vi /etc/sysctl.conf
```
add the following at the bottom of the line
```text
net.ipv4.tcp_syncookies=1
net.ipv4.tcp_max_syn_backlog=2048
net.ipv4.tcp_synack_retries=3
```
The best is to reboot your server!  
Ehhhh but What does this do?  

- Turn on Syncookies : net.ipv4.tcp_syncookies=1  
Syncookies allows your system to serve more TCP connection requests. Instead of logging each TCP connection request and waiting for a response, the system will instead send a cookie with its SYN-ACK response and delete the original SYN message. Any ACK response the system receives from the client will then contain information about this cookie, allowing the server to recreate the original entry. 1 enables this feature, 0 disables it. This setting is off by default.  
- Set Your Backlog Limit : net.ipv4.tcp_max_syn_backlog=2048  
This setting tells the system when to start using syncookies. When you have more than 2,048 (or whatever number you set it to) TCP connection requests in your queue, the system will start using syncookies. Keep this number pretty high to prevent from using syncookies with normal traffic.(Syncookies can be taxing for the CPU.)  
- Lower the Number of SYN-ACK Retries : net.ipv4.tcp_synack_retries = 3  
This setting tells your system how many times to retry sending the SYN-ACK reply before giving up. The default is 5. Lowering it to 3 essentially lowers the turnaround time on a TCP connection request to about 45 seconds. (It takes about 15 seconds per attempt.)  

## Troubleshoot

To check the number of concurrent TCP connections, run the following command:  
```netstat -an | grep 80 | grep ESTA | wc```  

To check concurrent connections sorted by IP, run the following:
```netstat -ntu | grep ESTABLISHED | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -nr```

