FROM node:15.8.0

ARG port
WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY dist /app/dist

EXPOSE $port

CMD ["npm", "start"]
