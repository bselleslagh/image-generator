# Use an official Node runtime as the parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the React app
RUN npm run build

# Install server dependencies
WORKDIR /usr/src/app/server
RUN npm install

# Move back to the app root
WORKDIR /usr/src/app

# Expose the port the app runs on
EXPOSE 5001

# Define the command to run the app
CMD ["node", "server/server.js"]