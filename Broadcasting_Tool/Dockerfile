FROM --platform=linux/amd64 node:lts-alpine

# set node user to un the application
RUN mkdir -p /home/node/app/node_modules \
    && mkdir -p /home/node/app/dist \
    && chown -R node:node /home/node/app 

RUN npm install pm2 -g


# Create app directory
WORKDIR /home/node/app


# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./


# Bundle app source
COPY --chown=node:node . .

# Set user
USER node

# To install other dependencies
RUN npm install
RUN npm run build:prod


# If you are building your code for production
# RUN npm install --only=production



EXPOSE 4001
# CMD [ "node", "dist/server.js" ]
CMD ["pm2-runtime", "dist/server.js"]
