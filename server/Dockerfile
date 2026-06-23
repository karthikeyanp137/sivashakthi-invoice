FROM ghcr.io/puppeteer/puppeteer:latest

# Set working directory
WORKDIR /usr/src/app

# Copy package files with correct permissions
COPY --chown=pptruser:pptruser package*.json ./

# Install dependencies
RUN npm ci

# Copy app source with correct permissions
COPY --chown=pptruser:pptruser . .

# Expose port
EXPOSE 5000

# Start server
CMD [ "npm", "start" ]
