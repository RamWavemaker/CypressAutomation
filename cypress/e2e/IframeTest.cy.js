import 'cypress-xpath';
import LoginPage from './Pages/LoginPage';
import DndWidget from './Pages/DndWidget';
import ProjectWorkspace from './Pages/ProjectWorkspace';
import $ from 'jquery';
import 'cypress-iframe';
import ProjectManager from './Pages/ProjectManager';
//clean
const RUN_COUNT = 10;

for (let i = 1; i <= RUN_COUNT; i++) {


describe(`Iframe W3Schools Test-${i}`, () => {   //-${i}
  it(`Iframe Test-${i}`, () => {
    cy.visit('https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_iframe');
    cy.frameLoaded('#iframeResult');
    cy.iframe('#iframeResult').within(() => {
      cy.get('iframe').then(($nestedIframe) => {
        const innerBody = $nestedIframe.contents().find('body');
        cy.wrap(innerBody).within(() => {
          cy.get('#tnb-google-search-mobile-show').click();
          cy.get('#tnb-google-search-input')
            .should('be.visible')
            .clear()
            .type('SQL Tutorial {enter}')
        });

        // Re-fetch the iframe again to access the new page content
        cy.get('iframe').then(($newIframe) => {
          const newBody = $newIframe.contents().find('body');
          cy.wrap(newBody).xpath("//h2[contains(text(),'Examples in Each Chapter')]").should('be.visible');
        });
      });
    });
  });
});
}
