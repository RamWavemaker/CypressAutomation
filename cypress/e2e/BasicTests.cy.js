import 'cypress-xpath';
import LoginPage from './Pages/LoginPage';
import DndWidget from './Pages/DndWidget';
import ProjectManager from './Pages/ProjectManager';
import ProjectWorkspace from './Pages/ProjectWorkspace';
import $ from 'jquery';

describe('Basic Test', () => {
  beforeEach(() => {
    const userCredentials = {
      email: 'ramcharan.kasinaboina@wavemaker.com',
      password: 'Wavemaker@Ram123'
    };

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
  it('Verifies the title', () => {
      LoginPage.visit("https://www.wavemakeronline.com/");
      let projectName = ProjectManager.create();
      DndWidget.performDndWidget('button','PAGE');
      ProjectWorkspace.saveWorkSpace();
      cy.url().then((url) => {
        cy.log("Original url is " + url); 
        // After capturing the original URL, perform other actions
        ProjectWorkspace.preview("ramcharan.kasinaboina@wavemaker.com","Wavemaker@Ram123");
        cy.get("button[name='button1']").should('be.visible');
        cy.wait(5000);
        // Now visit the original URL (ensure it's available after capturing)
        cy.visit(url, { failOnStatusCode: false });
      });
  });
});


describe('Test LDAP ', () => {
  beforeEach(() => {
    const userCredentials = {
      email: 'ramcharan.kasinaboina@wavemaker.com',
      password: 'Wavemaker@Ram123'
    };

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
  it('Verifies Ldap security', () => {
      LoginPage.visit("https://www.wavemakeronline.com/");
      let projectName = ProjectManager.create();
      DndWidget.performDndWidget('button','PAGE');
      //Navigate to security settings
      cy.get('button[name="wm-category-settings"]').click();
      cy.get('a[title="Security"]').click();
      cy.contains('span', 'Authentication & Authorization').click();
      cy.get('label[for="toggle-checkbox-"]').click();
      cy.get('span.float-right').click(); 

      // Select LDAP in the dropdown
      cy.get('select[name="wm-security-provider"]').select('LDAP');

      // Fill in LDAP configuration details
      cy.get('input[placeholder="eg: ldap://mydomain.com:389/"]').type('ldap://3.132.7.139');
      cy.get('#wm-security-manager-dn').type('cn=admin,dc=wavemaker,dc=com');
      cy.get('#wm-security-manager-pwd').type('Wma0m1nu536');
      cy.get('#wm-security-ldap-user-dn-pattern').type('cn=wmqa,dc=wavemaker,dc=com');
      cy.get("[name='wm-security-test-dn']").type('wmqa');
      cy.get("[name='wm-security-test-pwd']").type('wm3q9u536');

      // Test the LDAP connection
      cy.get('#wm-security-ldap-test-connection').click();
      cy.xpath("//wms-message[contains(@class, 'Auth')]//div[contains(text(), 'Connection successful')]").should('be.visible');

      // Save the configuration
      cy.contains('button', 'Save').click();
      cy.contains('button', 'Save').should('not.exist');
      cy.xpath("//div[contains(@class, 'right-action-bar')]//button[contains(text(), 'Save')]").should('not.exist');

      cy.url().then((url) => {
        ProjectWorkspace.preview("ramcharan.kasinaboina@wavemaker.com","Wavemaker@Ram123");
        LoginPage.basicPreviewLogin('wmqa','wm3q9u536');
        cy.get("button[name='button1']").should('be.visible');
        // Now visit the original URL (ensure it's available after capturing)
        cy.visit(url, { failOnStatusCode: false });
      });
  });
});
