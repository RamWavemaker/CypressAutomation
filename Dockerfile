FROM cypress/included:13.15.0

# Set working directory
WORKDIR /app

# Install awscli with Python 3 and PEP 668 compatibility
RUN apt-get update && \
    apt-get install -y python3-pip && \
    pip3 install --break-system-packages awscli

# Copy dependencies first for better layer caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy project files
COPY . .

# Default command — override in K8s job with a script if needed
CMD ["npx", "cypress", "run"]
