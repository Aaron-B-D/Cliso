# Imagen de la UI: Node compila con ng build y nginx sirve los estáticos. El contexto es Cliso.UI.
ARG NODE_VERSION=22
ARG NGINX_VERSION=1.27

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
# package-lock.json se generó con legacy-peer-deps (sin las peer dependencies, como @popperjs/core): npm ci necesita el mismo ajuste.
RUN npm ci --legacy-peer-deps
COPY . .
RUN npx ng build

FROM nginx:${NGINX_VERSION}-alpine
COPY --from=build /src/dist/Cliso.UI/browser /usr/share/nginx/html
# nginx.conf queda fuera del contexto de construcción: docker-compose.yml lo monta en /etc/nginx/conf.d/default.conf.
