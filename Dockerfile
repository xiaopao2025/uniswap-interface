FROM node:18 as builder
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn web build:production

FROM nginx:alpine as runner
RUN rm -rf /etc/nginx/conf.d/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
