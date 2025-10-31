FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN npm install

COPY . .

# https://github.com/vuejs/devtools/issues/977
ENV NODE_OPTIONS='--no-webstorage'

RUN npm run frontend:prod

EXPOSE 8888

ENV NODE_ENV=production

CMD ["npm", "run", "backend:prod"]
