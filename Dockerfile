FROM node:18-slim

RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  gcc \
  libc-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN corepack enable && yarn set version 3.2.3

COPY . .

RUN yarn install

EXPOSE 3000


CMD ["yarn", "web", "start"]

