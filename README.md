# Medrunner Client Portal

This portal brings the medrunner experience to the web !

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
