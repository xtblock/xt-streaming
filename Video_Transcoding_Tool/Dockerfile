FROM  node:16.13.1-alpine

# Install ffmpeg
RUN apk add  --no-cache ffmpeg
RUN apk add --no-cache bash

# set node user to un the application
RUN mkdir -p /home/node/app/node_modules \
    && mkdir -p /home/node/settings \
    && mkdir -p /home/node/media \
    && chown -R node:node /home/node/app \
    && chown -R node:node /home/node/settings \
    && chown -R node:node /home/node/media



# Create app directory
WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Set user
USER root

# To install other dependencies
RUN npm install

# If you are building your code for production
# RUN npm install --only=production


# Bundle app source
COPY --chown=node:node . .

EXPOSE 8085
CMD [ "node", "app.js","--docker" ]

# CMD ["pm2-runtime", "index.js"]
