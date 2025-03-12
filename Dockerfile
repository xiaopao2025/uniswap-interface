FROM node:18-alpine 


RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    libc-dev 


WORKDIR /app



RUN corepack enable && yarn set version 3.2.3

COPY . .

RUN yarn install

EXPOSE 3000


CMD ["yarn", "web", "start"]

