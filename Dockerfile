FROM node:18 as builder
WORKDIR /app
COPY . .
RUN yarn install
WORKDIR /app/apps/web
RUN yarn run build
FROM alpine as runner
RUN apk add --no-cache nginx
COPY --from=builder /app/apps/web/build /var/nginx
#COPY default.conf /etc/nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

