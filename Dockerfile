# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application source code
COPY . .

# Build the application (if it's a React app or similar)
RUN npm run build

# Expose the application port (change 3000 if your app uses a different port)
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]
