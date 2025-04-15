import 'cypress-xpath';
import LoginPage from './Pages/LoginPage';
import DndWidget from './Pages/DndWidget';
import ProjectManager from './Pages/ProjectManager';
import ProjectWorkspace from './Pages/ProjectWorkspace';

before(() => {
  cy.getCookie('auth_cookie').then((cookie) => {
    if (!cookie || !cookie.value) {
      cy.log("No valid auth cookie found. Logging in...");

      // Perform login
      LoginPage.visit("https://www.wavemakeronline.com/");
      LoginPage.login("anilkumar.akkaraveni@wavemaker.com","2907@WM#Studio");

      // Store the auth cookie
      cy.wait(2000);
      cy.getCookie('auth_cookie').then((newCookie) => {
        if (newCookie) {
          Cypress.env('authCookie', newCookie); // ✅ Store globally in Cypress env
          cy.log(`Stored Cookie: ${JSON.stringify(newCookie)}`);
        }
      });
    } else {
      cy.logdescribe("Session exists. Using existing auth cookie.");
      Cypress.env('authCookie', cookie);
    }
  });
});

beforeEach(() => {
  const authCookie = Cypress.env('authCookie');
  if (authCookie) {
    cy.setCookie(authCookie.name, authCookie.value); // ✅ Restore cookie before each test
  }
});

describe('Basic Test - Cookie Based', () => {
  it('Verifies the title and session cookies', () => {
    LoginPage.visit("https://www.wavemakeronline.com/");
    let projectName = ProjectManager.create();
    DndWidget.performDndWidget('button');

    ProjectWorkspace.saveWorkSpace();
    cy.url().then((url) => {
      cy.log("Original URL is " + url);
      ProjectWorkspace.preview("anilkumar.akkaraveni@wavemaker.com","2907@WM#Studio");
      cy.get("button[name='button1']").should('be.visible');
      cy.wait(5000);
      cy.visit(url, { failOnStatusCode: false });
    });
  });

  after(() => {
    cy.clearCookies(); // Optional cleanup
  });
});

describe('Test LDAP - Cookie Based', () => {
  it('Verifies LDAP security and cookies', () => {
    LoginPage.visit("https://www.wavemakeronline.com/");
    let projectName = ProjectManager.create();
    DndWidget.performDndWidget('button');

    // Navigate to security settings
    cy.get('button[name="wm-category-settings"]').click();
    cy.get('a[title="Security"]').click();
    cy.contains('span', 'Authentication & Authorization').click();
    cy.get('label[for="toggle-checkbox-"]').click();
    cy.get('span.float-right').click();

    // Set an authentication cookie
    cy.setCookie('auth_provider', 'LDAP');

    // Verify and modify cookies
    cy.getCookie('auth_provider').then((cookie) => {
      cy.log(`Authentication Provider: ${cookie.value}`);
    });

    // Fill in LDAP configuration details
    cy.get('select[name="wm-security-provider"]').select('LDAP');
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
      ProjectWorkspace.preview("anilkumar.akkaraveni@wavemaker.com","2907@WM#Studio");
      LoginPage.basicPreviewLogin('wmqa', 'wm3q9u536');
      cy.get("button[name='button1']").should('be.visible');
      cy.visit(url, { failOnStatusCode: false });
    });
  });

  after(() => {
    cy.clearCookies(); // Optional cleanup
  });
});
