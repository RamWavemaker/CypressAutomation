import 'cypress-xpath';
import LoginPage from './Pages/LoginPage';
import CreateProject from './Pages/CreateProject';
import DndWidget from './Pages/DndWidget';
import ProjectWorkspace from './Pages/ProjectWorkspace';
import $ from 'jquery';
import 'cypress-iframe';

const userCredentials = {
    email: 'ramcharan.kasinaboina@wavemaker.com',
    password: 'Wavemaker@Ram123'
  };

describe.skip('Ifrmae Test', () => {
  beforeEach(() => {

    cy.session(
      [userCredentials.email,userCredentials.password], 
      () => {
        LoginPage.visit("https://www.wavemakeronline.com/");
        LoginPage.login(userCredentials.email, userCredentials.password);
        
      },
      { cacheAcrossSpecs: true }
    );

    cy.getAllCookies().then((cookies) => {
      cy.log(JSON.stringify(cookies, null, 2)); 
    });
    
  });
  it.skip('Verifies the title', () => {
      LoginPage.visit("https://www.wavemakeronline.com/");
      let projectName = CreateProject.create();
      DndWidget.performDndWidget('iframe');
      cy.xpath("//span[@class='wm-heading' and text()='Page Structure']").click();
      cy.get("[name='wm-widget-group-widgets-tree'] input").type('iframe1');
      cy.get("a[data-searchkey='iframe1']").click();
      cy.get("input[data-identifier='property-iframesrc']").type("https://docs.wavemaker.com/learn/");
      cy.get("[data-identifier='property-width']").clear().type('800px');
      cy.get("[data-identifier='property-height']").clear().type('500px');
      ProjectWorkspace.saveWorkSpace();
      cy.wait(2000);
      cy.url().then((url) => {
        cy.log("Original url is " + url); 
        // After capturing the original URL, perform other actions
        ProjectWorkspace.preview(projectName,"ramcharan.kasinaboina@wavemaker.com","Wavemaker@Ram123");
        cy.url().then((url) =>{
          cy.origin('https://docs.wavemaker.com', () => {
            cy.visit('https://docs.wavemaker.com/learn/');
            cy.get('#docsearch-input').should('exist');
            cy.get('#docsearch-input').should('be.visible').type('Inspection Framework', { delay: 100 });
            cy.wait(5000);
            cy.get('[id="docsearch-item-0"]').click();
            cy.contains('h1', 'Inspection Framework').should('exist');
          });
          cy.wait(2000);
          cy.visit(url,{ failOnStatusCode: false });
        });
        cy.wait(5000);
        // Now visit the original URL (ensure it's available after capturing)
        cy.visit(url, { failOnStatusCode: false });
      });
  });
});


describe(' Iframe W3Schools Test', () => {
  it('Clicks search icon and types into tnb-google-search-input', () => {
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
        cy.wait(20000);

        // Re-fetch the iframe again to access the new page content
        cy.get('iframe').then(($newIframe) => {
          const newBody = $newIframe.contents().find('body');
          cy.wrap(newBody).xpath("//h2[contains(text(),'Examples in Each Chapter')]").should('be.visible');
        });
      });
    });
  });
});
