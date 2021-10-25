FROM  node:lts-alpine

# Install ffmpeg
RUN apk add  --no-cache ffmpeg

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
COPY --chown=root:root . .

EXPOSE 8080
CMD [ "node", "index.js" ]
