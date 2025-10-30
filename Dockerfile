FROM node:18-alpine


WORKDIR /usr/src/app

RUN apk add --no-cache bash


COPY package*.json ./

RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000
CMD ["npm", "start"]
