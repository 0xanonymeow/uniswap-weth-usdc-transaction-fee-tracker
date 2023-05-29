FROM node:lts-bullseye-slim

WORKDIR /app

COPY . .

# install dependencies
RUN npm ci

# build
RUN npm run build

ENV NODE_ENV production
EXPOSE 3000

CMD [ "npm", "start" ]