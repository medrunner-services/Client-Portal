# Medrunner Client Portal

This portal proposes a web experience for the client and staff of Medrunner.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

## Docker

### Build the image

```sh
docker build . -t client-portal:0.0.0
```

### Run the container

```sh
docker run --name client-portal -p 8080:80 -d client-portal:0.0.0
```
