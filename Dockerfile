FROM cypress/included:13.15.0

WORKDIR /app

# Copy only package files first, for caching
COPY package*.json ./


# Then copy the rest of the source code
COPY . .

# Run tests with support for CYPRESS_SPEC
CMD ["npx", "cypress", "run"]