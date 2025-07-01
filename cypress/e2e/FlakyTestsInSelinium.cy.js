import LoginPage from "./Pages/LoginPage";
import ProjectManager from "./Pages/ProjectManager";
import ProjectWorkspace from "./Pages/ProjectWorkspace";
import DndWidget from "./Pages/DndWidget";
import AppRuntimeUtils from "../utils/AppRuntimeUtils";
import FlakyTestsInSeliniumRunPage from "./RunPages/FlakyTestsInSeliniumRunPage";
import ApiDesginer from "./Pages/ApiDesginer";
import WorkSpacePage from "./Pages/WorkSpacePage";

const userCredentials = {
  email: 'ramcharan.kasinaboina@wavemaker.com',
  password: 'Wavemaker@Ram123'
};
//clean
const RUN_COUNT = 1;

let projectName = null;

for (let i = 1; i <= RUN_COUNT; i++) {
describe(`Test LDAP - Cookie Based-${i}`, () => {

  beforeEach(() => {

    cy.session(
      [userCredentials.email, userCredentials.password],
      () => {
        LoginPage.visit("https://www.wavemakeronline.com/");
        LoginPage.login(userCredentials.email, userCredentials.password);
      }
    );

    cy.getAllCookies().then((cookies) => {
      cy.log(JSON.stringify(cookies, null, 2));
    });

    cy.getCookie('JSESSIONID').then((cookie) => {
      Cypress.env('CJSESSIONID', cookie.value);
    });

  });


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
});

afterEach(() =>{
  if(projectName!=null){
    cy.wait(2000);
    ProjectManager.deleteCreatedProject(projectName);
  }
})
}