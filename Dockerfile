FROM node:18 as builder
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn web build:production

FROM alpine as runner
RUN apk add --no-cache nginx
COPY --from=builder /app/apps/web/build /usr/share/nginx/html
# Uncomment this if you have a custom nginx config
#COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
