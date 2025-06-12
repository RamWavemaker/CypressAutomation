#!/bin/bash
i=1
for spec in $(find cypress/e2e -name "*.cy.js"); do
  job_name="cypress-job-$i"
  sed "s/{{JOB_ID}}/$i/g; s#{{SPEC_FILE}}#$spec#g" app-job.yaml > generatedJobs/job-$i.yaml
  kubectl apply -f generatedJobs/job-$i.yaml
  ((i++))
done
