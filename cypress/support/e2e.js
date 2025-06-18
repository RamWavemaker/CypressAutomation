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

import '@4tw/cypress-drag-drop';

import "allure-cypress";
import addAttachment from 'allure-cypress';


Cypress.on('test:after:run', (test, runnable) => {
    if (test.state === 'failed') {
      const specName = Cypress.spec.name;
      const screenshotFileName = `${runnable.parent.title} -- ${test.title} (failed).png`;
      const screenshotPath = `cypress/screenshots/${specName}/${screenshotFileName}`;
  
      addAttachment('Screenshot on failure', screenshotPath, 'image/png');
    }
});

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('renderProps')) {
    // Suppress that specific error
    return false;
  }

  // Optional: suppress cy.origin serialization error if you're not doing cross-domain data sharing
  if (err.message.includes('cy.origin() could not serialize the subject')) {
    return false;
  }

  return true; // Let all other errors fail the test
});