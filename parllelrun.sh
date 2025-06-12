#!/bin/bash

# Number of parallel instances to run
PARALLEL_COUNT=4

# Set your build ID (can use timestamp or UUID for uniqueness)
CI_BUILD_ID="local-build-$(date +%s)"

# Cypress run command (edit if needed)
CYPRESS_CMD="npx cypress-cloud run --parallel --record --key xyz --ci-build-id $CI_BUILD_ID"

# Function to run Cypress
run_cypress() {
  echo "Starting Cypress instance $1 with build ID $CI_BUILD_ID"
  $CYPRESS_CMD &
}

# Launch parallel instances
for i in $(seq 1 $PARALLEL_COUNT); do
  run_cypress $i
done

# Wait for all background jobs to finish
wait

echo "All parallel Cypress instances completed."
