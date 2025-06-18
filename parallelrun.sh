#!/bin/bash

# === CONFIGURATION ===
SPEC_DIR="cypress/e2e"
SPEC_PATTERN="*.cy.js"
NUM_GROUPS=3
PARALLEL=true
JOB_TEMPLATE="parllelrunjob.yaml"
NAMESPACE="default"
IMAGE_NAME="ramcharan7431/cypress-tests:latest"

# === COLLECT SPEC FILES ===
mapfile -t ALL_SPECS < <(find "$SPEC_DIR" -name "$SPEC_PATTERN" | sort)
TOTAL_SPECS=${#ALL_SPECS[@]}

if [ "$TOTAL_SPECS" -eq 0 ]; then
  echo "❌ No spec files found in $SPEC_DIR"
  exit 1
fi

echo "✅ Found $TOTAL_SPECS spec files"
echo "📦 Splitting into $NUM_GROUPS groups"

# === GROUP SPECS ===
declare -a GROUPED_SPECS
for ((i=0; i<TOTAL_SPECS; i++)); do
  group=$((i % NUM_GROUPS))
  GROUPED_SPECS[$group]+="${ALL_SPECS[$i]},"
done

# === RUN JOBS ===
for ((i=0; i<NUM_GROUPS; i++)); do
  JOB_NAME="cypress-job-$((i+1))"
  JOB_NAME_LOWER=$(echo "$JOB_NAME" | tr '[:upper:]' '[:lower:]')
  ALLURE_DIR="allure-results-worker-$((i+1))"
  SPEC_FILES="${GROUPED_SPECS[$i]%,}"  # Remove trailing comma

  export JOB_NAME=$JOB_NAME_LOWER
  export NAMESPACE IMAGE_NAME ALLURE_DIR SPEC_FILES

  echo "🚀 Applying job: $JOB_NAME_LOWER"
  envsubst < "$JOB_TEMPLATE" | kubectl apply -f -

  if [ "$PARALLEL" = false ]; then
    kubectl wait --for=condition=complete --timeout=300s job/$JOB_NAME_LOWER -n $NAMESPACE
  fi
done

if [ "$PARALLEL" = true ]; then
  echo "⏳ Waiting for all parallel jobs to complete..."
  kubectl wait --for=condition=complete --timeout=600s jobs --all -n $NAMESPACE
  echo "✅ All jobs completed"
fi
