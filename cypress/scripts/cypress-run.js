const cypress = require('cypress');

async function runTests() {
  try {
    console.log('🚀 Starting Cypress tests...');

    const results = await cypress.run({
      browser: 'chrome', // Change to 'firefox' if needed
      headless: true, // Run tests in headless mode
      record: true, // Enable Cypress Dashboard recording if needed
      parallel: true, // Enable parallel execution
      spec: 'cypress/e2e/**/*.cy.js' // Run all test files in the e2e folder
    });

    console.log('✅ Cypress tests completed!');

    // Check if 'runs' exists before accessing it
    if ('runs' in results && Array.isArray(results.runs)) {
      const totalFailed = results.runs.reduce((acc, run) => acc + (run.stats.failures || 0), 0);

      if (totalFailed > 0) {
        console.error(`❌ ${totalFailed} test(s) failed.`);
        process.exit(1);
      } else {
        console.log('🎉 All tests passed successfully!');
        process.exit(0);
      }
    } else {
      console.error('❌ Cypress run failed before test execution.');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Cypress run failed:', err.message || err);
    process.exit(1);
  }
}

// Execute the function
runTests();
