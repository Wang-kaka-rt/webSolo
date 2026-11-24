# Hostinger Node.js deployment

This archive contains the Node.js source for the Pangpangshop application. It intentionally excludes `node_modules`, `.next`, and `.env.local`; install and build on the server so native dependencies match Hostinger's Linux environment.

## In hPanel

1. Create a MySQL database and database user, then record its hostname, database name, username, and password.
2. Create a Node.js application with Node.js 22 or newer. Upload and extract this ZIP in the application's working directory.
3. In the application's environment-variable settings, add every value below. Do not upload a real `.env.local` file.
4. From the application's terminal, run:

   ```sh
   npm ci
   npm run db:migrate
   npm run db:seed
   npm run db:seed-admin
   npm run build
   ```

The build script explicitly uses Webpack instead of Turbopack. This is required on Hostinger servers where the system C library cannot load Turbopack's native bindings.

5. Set the start command to `npm run start`, then restart the application and attach the domain.

## Required environment variables

```env
DATABASE_URL="mysql://USER:PASSWORD@MYSQL_HOST:3306/DATABASE"
RESERVATION_HOLD_HOURS="48"
ADMIN_SESSION_SECRET="a-long-random-secret"
INITIAL_ADMIN_EMAIL="owner@example.com"
INITIAL_ADMIN_PASSWORD="a-long-unique-password"
FTP_HOST="ftp.example.com"
FTP_PORT="21"
FTP_USER="ftp-user"
FTP_PASSWORD="a-strong-ftp-password"
```

`DATABASE_URL` values must be URL-encoded when a username or password contains reserved characters such as `@`, `:`, `/`, or `#`. The initial-admin command can be run once; it stores a password hash in MySQL.

## Included and excluded files

The archive includes `src`, `public`, `scripts`, package manifests, and application configuration. It excludes local dependencies, build cache, Git data, local environment variables, and source-only design material.
