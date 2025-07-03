import LoginPage from "./Pages/LoginPage";
import ProjectManager from "./Pages/ProjectManager";
import ProjectWorkspace from "./Pages/ProjectWorkspace";
import DndWidget from "./Pages/DndWidget";
import AppRuntimeUtils from "../utils/AppRuntimeUtils";
import FlakyTestsInSeliniumRunPage from "./RunPages/FlakyTestsInSeliniumRunPage";
import ApiDesginer from "./Pages/ApiDesginer";
import WorkSpacePage from "./Pages/WorkSpacePage";

const userCredentials = {
    email: 'test.automate12@wavemaker.com',
    password: 'Wavemaker@123'
};

const RUN_COUNT = 4;
let projectName = null;

for (let i = 1; i <= RUN_COUNT; i++) {
    describe(`DatabaseProperties-${i}`, () => { //${i}
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
    
      it(`DatabasePropertiesChange-${i}`, () => {
        LoginPage.visit("https://www.wavemakeronline.com/");
        projectName = ProjectManager.create();
        ProjectWorkspace.addDataBase('HRDB');
        DndWidget.performDndWidget('table', 'PAGE');
        cy.get("div[name='wms-source-data-source'] input").type('hrdb {enter}');
        cy.get("div[name='wms-source-data-operation'] input").type("Employee {enter}");
        cy.get("input[name='variable-name-input']").clear().type('employee ');
        cy.get("input[name='maxresults-input']").clear().type('20');
        cy.get("[name='btn-next-page']").click();
        cy.get('[aria-label="Tabs"] a span').contains('Editable').click();
        cy.get("[id='wms-tpl-grid-form-dialog']").click();
        cy.get("[name='btn-next-page']").click();
        cy.get("[id='wms-nav-Basic']").click();
        cy.get("[name='btn-next-page']").click();
        cy.get("[name='btn-next-page']").click();
        cy.get("[id='wms-tpl-two-column']").click();
        cy.get("[name='btn-next-page']").click();
        cy.get("[name='btn-next-page']").click(); //done button
        ProjectWorkspace.saveWorkSpace();
        cy.get('span.dirty-icon').should('not.exist');
        cy.get("button[name='wm-script-tab-btn']").should('be.enabled').click();
        cy.get("button[title='Design']").should("be.enabled").click();
        cy.contains('span.wm-heading', 'Page Structure').prev('button[name="wm-expand-widget-accordian-btn"]').should('be.visible').and('be.enabled').click();
        cy.get("a[data-searchkey='firstname']").should('be.visible').click();
        cy.get("input[data-identifier='property-displayname']").clear().type("userfirstname {enter}");
        cy.get("input[data-identifier='property-width']").clear().type("100 {enter}");
        cy.get('i[title="Styles"]').should("exist").click();
        cy.get("input[data-identifier='property-fontsize']").clear().type("50px {enter}");
        cy.get("a[data-searchkey='birthdate']").should('be.visible').click();
        cy.get("i[title='Properties']").should("exist").click();
        cy.get('input[name="checkboxset_null"][value="1"]').check();
      }); 
      
      it(`QueryExecutionRun-${i}`, () => {
          LoginPage.visit("https://www.wavemakeronline.com/");
          projectName = ProjectManager.create();
          ProjectWorkspace.addDataBase('HRDB');
          ProjectWorkspace.goToDatabase();
          cy.get("button[name='wm-db-query']").click();
          cy.get('.monaco-editor textarea.inputarea')
          .first()
          .click({ force: true })
          .type('SELECT * FROM employee;', { force: true, delay: 10 });
          cy.get("button[name='btn-run-query']").click();
          cy.get('td[title="Eric"]').should('exist');
      });

      afterEach(() => {
          if(projectName!=null){
            cy.wait(2000);
            ProjectManager.deleteCreatedProject(projectName);
          }
      });
    })
}