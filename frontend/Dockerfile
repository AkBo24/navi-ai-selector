FROM node

# Set the working directory
RUN mkdir -p /usr/src/app/

# # Copy package.json and package-lock.json to the working directory
# copy package.json /usr/src/app/
COPY . /usr/src/app/

# Install dependencies
RUN npm --prefix /usr/src/app install /usr/src/app
