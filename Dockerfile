# Dockerfile
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app code
COPY . .

# App runs on port 3000
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
