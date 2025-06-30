import 'cypress-xpath';
import LoginPage from './Pages/LoginPage';
import DndWidget from './Pages/DndWidget';
import ProjectManager from './Pages/ProjectManager';
import ProjectWorkspace from './Pages/ProjectWorkspace';
//clean
const userCredentials = {
  email: 'test.automate13@wavemaker.com',
  password: 'Wavemaker@123'
};

const RUN_COUNT = 1;

for (let i = 1; i <= RUN_COUNT; i++) {
before(() => {
  cy.getCookie('auth_cookie').then((cookie) => {
    if (!cookie || !cookie.value) {
      cy.log("No valid auth cookie found. Logging in...");

      // Perform login
      LoginPage.visit("https://www.wavemakeronline.com/");
      LoginPage.login(userCredentials.email, userCredentials.password);

      cy.wait(3000);

      // After login, get and set auth_cookie and JSESSIONID
      cy.getCookie('auth_cookie').then((newAuthCookie) => {
        if (newAuthCookie && newAuthCookie.value) {
          Cypress.env('authCookie', newAuthCookie);
          cy.log(`✅ Stored auth_cookie: ${JSON.stringify(newAuthCookie)}`);
        }
      });

      cy.getCookie('JSESSIONID').then((newSessionCookie) => {
        if (newSessionCookie && newSessionCookie.value) {
          Cypress.env('CJSESSIONID', newSessionCookie.value); // ✅ set to env
          cy.log(`✅ Stored JSESSIONID: ${newSessionCookie.value}`);
        }
      });

    } else {
      // Use existing cookie
      Cypress.env('authCookie', cookie);
      cy.log("✅ Session exists. Using existing auth_cookie.");

      // Get and store current JSESSIONID
      cy.getCookie('JSESSIONID').then((existingSessionCookie) => {
        if (existingSessionCookie && existingSessionCookie.value) {
          Cypress.env('CJSESSIONID', existingSessionCookie.value); // ✅ set to env
          cy.log(`✅ Stored existing JSESSIONID: ${existingSessionCookie.value}`);
        }
      });
    }
  });
});

beforeEach(() => {
  const authCookie = Cypress.env('authCookie');
  const jsessionId = Cypress.env('CJSESSIONID');

  // Restore auth cookie
  if (authCookie && authCookie.name && authCookie.value) {
    cy.setCookie(authCookie.name, authCookie.value);
  }

  // Restore JSESSIONID
  if (jsessionId) {
    cy.setCookie('JSESSIONID', jsessionId);
  }
});

let projectName = null;

describe(`Basic Test - Cookie Based-${i}`, () => {    //-${i}
  it(`Verifies the title and session cookies-${i}`, () => {
    LoginPage.visit("https://www.wavemakeronline.com/");
    projectName = ProjectManager.create();
    DndWidget.performDndWidget('button','PAGE');

    ProjectWorkspace.saveWorkSpace();
    cy.url().then((url) => {
      cy.log("Original URL is " + url);
      ProjectWorkspace.preview(userCredentials.email, userCredentials.password);
      cy.get("button[name='button1']").should('be.visible');
      cy.wait(5000);
      cy.visit(url, { failOnStatusCode: false });
    }).then(() => {
      // ✅ Cleanup step
      ProjectManager.deleteCreatedProject(projectName);
    });
  });

  after(() => {
    cy.clearCookies(); // Optional cleanup
  });

  afterEach(() => {
    if(projectName!=null){
      cy.wait(2000);
      ProjectManager.deleteCreatedProject(projectName);
    }
  });
});

describe(`Test LDAP - Cookie Based-${i}`, () => {
  it(`Verifies LDAP security and cookies-${i}`, () => {
    LoginPage.visit("https://www.wavemakeronline.com/");
    projectName = ProjectManager.create();
    DndWidget.performDndWidget('button','PAGE');

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
      ProjectWorkspace.preview(userCredentials.email, userCredentials.password);
      LoginPage.basicPreviewLogin('wmqa', 'wm3q9u536');
      cy.get("button[name='button1']").should('be.visible');
      cy.visit(url, { failOnStatusCode: false });
    }).then(() => {
      // ✅ Cleanup step
      ProjectManager.deleteCreatedProject(projectName);
    });
  });

  after(() => {
    cy.clearCookies(); // Optional cleanup
  });

  afterEach(() => {
    if(projectName!=null){
      cy.wait(2000);
      ProjectManager.deleteCreatedProject(projectName);
    }
  });
});
}
