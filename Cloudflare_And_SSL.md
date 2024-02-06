# NGINX and Cloudflare setup
In this article I will show how to setup Cloudflare’s free SSL certificate for a domain name.  
Before we begin, make sure that your domain is using Cloudflare’s DNS.  

## Getting certificate from Cloudflare

1. Login to your Cloudflare dashboard and select your domain.  

2. Click on “Crypto” tab and within SSL settings, select “Full”  

3. Scroll down a bit and within “Origin Certificates” settings, click “Create Certificate”  

4. A pop up window will open. Under the “List the hostnames”, you will see your domain name.  

If you want to host multiple domains in your web server, then you can also add those domains in that field.  
Make sure that certificate validity is set to 15 years.  
Now click next.  
You will see the certificate file and along with key file that has been generated according to your domain name.  
We need that certificate file and key file later for the web server.

5. Do not close the window and copy the contents of the “Origin Certificate” box.  
Create an empty file named “ssl.pem” and paste the copied contents within that file.  
Follow the similar step for “Private key” and save the file as “ssl.key”

## Setup Web Server to use generated certificates
First, transfer those .pem and .key files to /etc/ssl/#website_name# directory. (use WINSCP or any other SSH transfer tool)  
Now to use those files in our Web Server, we need to configure the SSL settings for port 443 listener.

```
vi /etc/nginx/sites-available/cms.conf
```
and make the followin changes at the begining of the file
```
server {
        listen 80;
        listen [::]:80;
        listen 443 ssl;
        listen [::]:443 ssl;
        http2 on;

        ssl_certificate /etc/ssl/#website_name#/cert.pem;
        ssl_certificate_key /etc/ssl/#website_name#/key.pem;
```
run : ```nginx -t``` to see if there are any errors if not reboot and off you go
