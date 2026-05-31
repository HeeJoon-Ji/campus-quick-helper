# Step 1: Base image
FROM node:22-alpine

# Step 2: Set working directory
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json (if exists)
# This maximizes Docker layer caching
COPY package*.json ./

# Step 4: Install dependencies
# Using 'npm ci' for a faster, more reliable build in production-like environments
RUN npm install --production

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Expose the application port
EXPOSE 3000

# Step 7: Define the command to run the app
CMD [ "node", "app.js" ]
