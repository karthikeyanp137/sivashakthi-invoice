FROM ghcr.io/puppeteer/puppeteer:latest

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy app source
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD [ "npm", "start" ]
