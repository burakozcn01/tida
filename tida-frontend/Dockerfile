FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

RUN npm run build

RUN mkdir -p /app/build/static

FROM nginx:1.25-alpine as production
COPY --from=build /app/build /app/build
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /app/build

CMD ["tail", "-f", "/dev/null"]