// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

import 'cypress-xpath';

import '@4tw/cypress-drag-drop'

import "allure-cypress";

Cypress.on('uncaught:exception', (err, runnable) => {
    // Ignore renderProps() bug from Allure
    if (err.message.includes('renderProps is not a function')) {
      return false; // prevents test from failing
    }
  
    // Let other exceptions fail the test
    return true;
});
  