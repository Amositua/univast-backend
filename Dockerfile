FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy all project files
COPY . .

# Expose the port your app uses
EXPOSE 5000

# Start command (adjust to match your start script)
CMD ["node", "server.js"]