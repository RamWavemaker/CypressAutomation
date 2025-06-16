FROM cypress/included:13.15.0

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN apt-get update && apt-get install -y python3-pip && \
    pip3 install --break-system-packages awscli
RUN npm install

# Copy rest of the project files
COPY . .

# Run tests (supports environment variables and CYPRESS_SPEC override)
CMD ["npx", "cypress", "run"]
