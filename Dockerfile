# Step 1: Use the official Node.js image as the base image
FROM node:18

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the `package.json` and `package-lock.json` files to the container
COPY package*.json ./

# Step 4: Install the dependencies inside the container
RUN npm install

# Step 5: Copy the rest of your application files to the container
COPY . .

# Step 6: Expose the port your application runs on (adjust the port if needed)
EXPOSE 3000

# Step 7: Specify the command to start your application
CMD ["node", "backend.js"]
