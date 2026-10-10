# Production deployment

The recommended setup is one Linux server (or VPS) running Nginx in front of the Node.js API, with MySQL on the
same server or a managed database. The React build is static and can be served by Nginx directly.

```
Browser ──HTTPS──► Nginx ──► /            frontend/dist (static files)
                         └─► /api/*       Node.js API on 127.0.0.1:5000 ──► MySQL
```

## 1. Server prerequisites

- Node.js 20 LTS or newer, npm
- MySQL 8.0+ (or MariaDB 10.4+)
- Nginx, and a TLS certificate (e.g. Let's Encrypt via Certbot)
- A process manager such as PM2 or systemd

## 2. Database

Create a dedicated database user (never use `root` in production):

```sql
CREATE DATABASE shreemadhav CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'smos_app'@'localhost' IDENTIFIED BY 'a-long-random-password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON shreemadhav.* TO 'smos_app'@'localhost';
FLUSH PRIVILEGES;
```

## 3. Backend

```bash
cd /var/www/shreemadhav/backend
npm ci --omit=dev
cp .env.example .env
chmod 600 .env
```

Production values in `backend/.env`:

```ini
NODE_ENV=production
PORT=5000
CORS_ORIGINS=https://www.your-domain.com
TRUST_PROXY=true
SERVE_FRONTEND=false

DB_HOST=127.0.0.1
DB_USER=smos_app
DB_PASSWORD=…
DB_NAME=shreemadhav

JWT_SECRET=…            # 64+ random characters; the server refuses to start with a weak one
JWT_EXPIRES_IN=8h

UPLOAD_DIR=uploads      # or an absolute path on a persistent, backed-up volume
```

```bash
ADMIN_EMAIL=you@company.com ADMIN_PASSWORD='…' npm run setup
pm2 start server.js --name smos-api
pm2 save && pm2 startup
```

The upload directory must be writable by the Node process, **not** inside any web-served folder, and included in
backups.

## 4. Frontend

```bash
cd /var/www/shreemadhav/frontend
npm ci
echo "VITE_SITE_URL=https://www.your-domain.com" > .env.production
echo "VITE_API_BASE_URL=/api" >> .env.production
npm run build      # outputs dist/, including sitemap.xml and robots.txt for VITE_SITE_URL
```

## 5. Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name www.your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/www.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.your-domain.com/privkey.pem;

    root /var/www/shreemadhav/frontend/dist;
    index index.html;

    client_max_body_size 30m;   # CV + 4 documents at 5 MB each, plus form fields

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # Fingerprinted build assets never change.
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /images/ {
        expires 30d;
    }

    # Single-page app: unknown paths render index.html.
    location / {
        try_files $uri /index.html;
        add_header Cache-Control "no-cache";
    }
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://www.your-domain.com$request_uri;
}
```

**Simpler alternative:** set `SERVE_FRONTEND=true` in `backend/.env` and Express serves `frontend/dist` itself (with
the same security headers and caching). Nginx then only needs to proxy everything to port 5000.

## 6. Backups

- Daily `mysqldump --single-transaction shreemadhav` to off-server storage.
- Back up the `uploads/` directory on the same schedule; database rows and files must be restored together.

## 7. Launch checklist

- [ ] Contact details and social links entered in Admin → Settings
- [ ] Hindi and Punjabi copy reviewed by native speakers
- [ ] Privacy Policy and Terms reviewed by the company's legal adviser
- [ ] `VITE_SITE_URL` set before building (sitemap, canonical URLs, Open Graph)
- [ ] `NODE_ENV=production`, strong `JWT_SECRET`, dedicated DB user, HTTPS enforced
- [ ] `ADMIN_PASSWORD` removed from `.env` after the first administrator is created
- [ ] Sitemap submitted in Google Search Console
- [ ] Backups configured and a restore tested
