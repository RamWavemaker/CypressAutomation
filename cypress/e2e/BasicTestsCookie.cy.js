import 'cypress-xpath';
import LoginPage from './Pages/LoginPage';
import DndWidget from './Pages/DndWidget';
import ProjectManager from './Pages/ProjectManager';
import ProjectWorkspace from './Pages/ProjectWorkspace';
//clean
const userCredentials = {
  email: 'test.automate11@wavemaker.com',
  password: 'Wavemaker@123'
};

const RUN_COUNT = 5;

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
});



afterEach(() => {
  if(projectName!=null){
    cy.wait(2000);
    ProjectManager.deleteCreatedProject(projectName);
  }
});



}
