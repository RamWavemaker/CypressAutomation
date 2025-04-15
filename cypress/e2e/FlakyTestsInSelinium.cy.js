import LoginPage from "./Pages/LoginPage";
import ProjectManager from "./Pages/ProjectManager";
import ProjectWorkspace from "./Pages/ProjectWorkspace";
import DndWidget from "./Pages/DndWidget";
import AppRuntimeUtils from "../utils/AppRuntimeUtils";
import FlakyTestsInSeliniumRunPage from "./RunPages/FlakyTestsInSeliniumRunPage";

const userCredentials = {
  email: 'ramcharan.kasinaboina@wavemaker.com',
  password: 'Wavemaker@Ram123'
};

describe.skip('WidgetPropertiesTest',() =>{

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

    it.skip('selectFirstRecordInMultiSelect',() =>{
        LoginPage.visit("https://www.wavemakeronline.com/");
        let projectName = ProjectManager.create();
        ProjectWorkspace.addDataBase('HRDB');
        DndWidget.datatableDrop('table');
        ProjectWorkspace.openPageStructureAndSearchWidget('UserTable1');
        cy.get("[data-identifier='property-advancedsettings']").click();
        cy.get('#toggle-checkbox-property-multiselect').check({ force: true });
        cy.get('#toggle-checkbox-property-gridfirstrowselect').check({force: true});
        cy.get("wms-dialog-footer button[title='Save']").click();
        ProjectWorkspace.saveWorkSpace();
        cy.get('span.dirty-icon').should('not.exist');
        cy.url().then((url) =>{
          ProjectWorkspace.preview(projectName,userCredentials.email,userCredentials.password);
          cy.get('tr[data-row-id="0"] input[type="checkbox"]').should('be.checked');
          cy.get("div[name='UserTable1'] .app-datagrid-paginator a").contains('2').click();
          cy.get("tr[data-row-id='0'] input[type='checkbox']").should('not.be.checked');
          cy.get("div[name='UserTable1'] .app-datagrid-paginator a").contains('1').click();
          cy.get("tr[data-row-id='0'] input[type='checkbox']").should('be.checked');
          cy.wait(5000);
          cy.visit(url, { failOnStatusCode: false });
        });
    });
})

describe('App runtime TestCases',() =>{
  it('verifyIFrameDialog',() =>{
    const fileName = 'WidgetsLocalisationApp.zip';
    const WidgetsLocalisationS3path = "wavemaker-test-apps/AutomationProjects/11.10/WidgetsLocalisationApp";
    const localDownloadPath = "home/ramcharank_500385/Documents/ProgramFiles/Visualstudio/CypressAutomation/cypress/downloads";
    AppRuntimeUtils.previewAppRuntime(userCredentials.email,userCredentials.password,fileName,WidgetsLocalisationS3path,localDownloadPath,'PROJECT')
    .then(() =>{
      FlakyTestsInSeliniumRunPage.verifyIFrameDialog();
    }).then(()=>{
      cy.get('@currentProjectId').then((projectId)=>{
        ProjectManager.deleteProject(projectId);
      });
    })
  });

  it('verifyPageDialog',() =>{
    const fileName = 'WidgetsLocalisationApp.zip';
    const WidgetsLocalisationS3path = "wavemaker-test-apps/AutomationProjects/11.10/WidgetsLocalisationApp";
    const localDownloadPath = "home/ramcharank_500385/Documents/ProgramFiles/Visualstudio/CypressAutomation/cypress/downloads";
    AppRuntimeUtils.previewAppRuntime(userCredentials.email,userCredentials.password,fileName,WidgetsLocalisationS3path,localDownloadPath,'PROJECT')
    .then(() =>{
      FlakyTestsInSeliniumRunPage.verifyPageDialog();
    }).then(()=>{
      cy.get('@currentProjectId').then((projectId)=>{
        ProjectManager.deleteProject(projectId);
      });
    })
  })
})