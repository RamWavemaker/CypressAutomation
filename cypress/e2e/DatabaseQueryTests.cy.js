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

const RUN_COUNT = 1;
let projectName = null;

for (let i = 1; i <= RUN_COUNT; i++) {
    describe(`WidgetPropertiesTest-${i}`, () => { //${i}
    
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