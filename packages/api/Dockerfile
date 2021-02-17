FROM node:15.8.0
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY dist /app/dist
CMD ["npm", "start"]
