# NGINX and Cloudflare — SSL Setup

This guide walks through setting up Cloudflare's free **Origin SSL certificate** for your domain, then configuring NGINX to use it.

Before you start, make sure your domain is already using Cloudflare's DNS (i.e. your registrar's nameservers point at Cloudflare).

## Generate the Origin certificate in Cloudflare

1. **Log in** to your Cloudflare dashboard and select your domain.

2. Open the **SSL/TLS** tab in the left sidebar. Under **Overview**, set the SSL/TLS encryption mode to **Full (strict)**.

   > **Why Full (strict)?** "Full" alone trusts any certificate on your origin, including self-signed or expired ones — which means a network attacker could impersonate your origin. "Full (strict)" validates the origin certificate, which is exactly what Cloudflare's free Origin CA cert is signed by. Always use Full (strict) for production.

3. Go to **SSL/TLS → Origin Server** and click **Create Certificate**.

4. A dialog will appear. Under **Hostnames**, you'll see your domain name pre-filled. To cover the apex and the `www` subdomain, leave the default wildcards (e.g. `*.example.com` and `example.com`).

   - **Key type:** RSA (2048-bit) is fine for most setups; pick ECDSA if you specifically want it.
   - **Certificate validity:** set this to **15 years** (the maximum).

   Click **Create**.

5. **Do not close this window yet.** You'll be shown the certificate and private key in two separate boxes — both are only displayed once.

   - Copy the contents of the **Origin Certificate** box and save it as `cert.pem` on your machine.
   - Copy the contents of the **Private Key** box and save it as `key.pem` on your machine.

   > **Important:** the private key is shown **exactly once**. If you close the dialog without saving it, you'll have to revoke the cert and create a new one.

## Install the certificate on your server

Transfer `cert.pem` and `key.pem` to your VPS using WinSCP (or any SCP/SFTP client). Place them in a domain-specific directory under `/etc/ssl/`:

```bash
mkdir -p /etc/ssl/yourdomain.com
# Upload cert.pem and key.pem into /etc/ssl/yourdomain.com/ via WinSCP
```

Once uploaded, lock down the private key so it isn't world-readable:

```bash
chmod 600 /etc/ssl/yourdomain.com/key.pem
chmod 644 /etc/ssl/yourdomain.com/cert.pem
chown root:root /etc/ssl/yourdomain.com/*.pem
```

## Configure NGINX to use the certificate

Edit your site config:

```bash
vi /etc/nginx/sites-available/cms.conf
```

At the top of the `server { ... }` block, add the SSL listeners and certificate paths. **Replace `yourdomain.com` with your real domain.**

```nginx
server {
    listen 80;
    listen [::]:80;
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;

    ssl_certificate     /etc/ssl/yourdomain.com/cert.pem;
    ssl_certificate_key /etc/ssl/yourdomain.com/key.pem;

    # ... the rest of your server block ...
}
```

> **Tip:** for a production site, you'll also want a `server` block that redirects plain HTTP to HTTPS. Cloudflare can handle this automatically with the **Always Use HTTPS** setting in **SSL/TLS → Edge Certificates**.

## Test and reload

Test the configuration first:

```bash
nginx -t
```

If you see `syntax is ok` and `test is successful`, reload NGINX:

```bash
systemctl reload nginx
```

If `nginx -t` reports an error, it will tell you exactly which line in which file to fix. The most common mistakes are:

- A typo in the certificate path (file doesn't exist or wrong domain folder)
- Permissions on `key.pem` too restrictive for the nginx user to read — `chmod 600` and `chown root:root` is fine because the nginx master process runs as root
- Missing `;` at the end of an `ssl_certificate` line

## After it's working

Verify the certificate in your browser by visiting `https://yourdomain.com`. The lock icon should be present. Click it to confirm the certificate is issued by `Cloudflare Inc ECC CA-3` (or similar) and is valid for 15 years.

You can also check externally with [SSL Labs' Server Test](https://www.ssllabs.com/ssltest/) — for a hotel sitting behind Cloudflare you'll typically get an **A** or **A+** grade with the SSL/TLS setting on Full (strict).

> **One last thing:** Cloudflare Origin Certificates are **only trusted by Cloudflare**, not by browsers directly. If you ever turn off the Cloudflare proxy (orange cloud → grey cloud), browsers will reject the certificate. This is by design — Origin certs are for the Cloudflare → origin link only. If you need a generally-trusted certificate, use [Let's Encrypt](https://letsencrypt.org/) via Certbot instead.
