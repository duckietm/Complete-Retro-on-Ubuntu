# Example to allow Cloudflare

Make a directory to save the script : ```mkdir /var/scripts```
Create a file for example : ```>/var/scripts/CF_UFW_Settings.sh```
Then make it executable: ```chmod +x /var/scripts/CF_UFW_Settings.sh```
Edit the file and paste below: ```vi /var/scripts/CF_UFW_Settings.sh```
```
#!/bin/sh
curl -s https://www.cloudflare.com/ips-v4 -o /tmp/cf_ips
for cfip in `cat /tmp/cf_ips`; do ufw route allow proto tcp from $cfip comment 'Cloudflare IP'; done
ufw reload > /dev/null
```
Execute it : /var/scripts/./CF_UFW_Settings.sh

You can see here the rule for the UFW : ```ufw route allow proto tcp from $cfip comment 'Cloudflare IP'```
So we use ** ufw route **