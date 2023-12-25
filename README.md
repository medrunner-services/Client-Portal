# Medrunner Client Portal

This portal brings the medrunner experience to the web !

## Issues
All issues are tracked in [Youtrack](https://medrunner.youtrack.cloud/)

## Project Setup

```sh
npm install
```

### .env

```dotenv
VITE_API_URL
VITE_CALLBACK_URL
VITE_DISCORD_CLIENT_ID
CROWDIN_TOKEN
VITE_AMPLITUDE_KEY
```
You can use `.env.development` and `.env.development-network` for different dev Vite modes and `.env.staging` and `.env.production` for different build Vite modes.

### Compile and Hot-Reload for Development

For local development on your machine
```sh
npm run dev
```

For local development exposed on your network
```sh
npm run dev-network
```

### Type-Check, Compile and Minify for production

Building for production deployment
```sh
npm run build
```

Building for a staging deployment
```sh
npm run build:staging
```

### Useful commands

Updating localizations files from Crowdin
```sh
npm run update-locals
```

Run prettier, eslint and typescript checks
```sh
npm run prepush
```