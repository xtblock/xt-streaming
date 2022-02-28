FROM  node:16.13.1-alpine

# set node user to un the application
RUN mkdir -p /home/node/app/node_modules \
    && chown -R node:node /home/node/app 


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

EXPOSE 8000 5555
CMD [ "node", "app.js" ]
# CMD ["pm2-runtime", "index.js"]