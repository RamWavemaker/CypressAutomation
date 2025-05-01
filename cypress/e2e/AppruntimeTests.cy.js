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

describe('Appruntime Testcases',()=>{
    it('Localization element intercept',()=>{
        const fileName = 'WidgetsLocalisationApp.zip';
        const WidgetsLocalisationS3path = "wavemaker-test-apps/AutomationProjects/11.10/WidgetsLocalisationApp";
        const localDownloadPath = "home/ramcharank_500385/Documents/ProgramFiles/Visualstudio/CypressAutomation/cypress/downloads";
        AppRuntimeUtils.previewAppRuntime(userCredentials.email, userCredentials.password, fileName, WidgetsLocalisationS3path, localDownloadPath, 'PROJECT')
            .then(() => {
                cy.get('select[name="select1"]').select('العربية');
                cy.get('a[name="anchor25"]').click();
                cy.get("div input[name='datetime5']").should('be.visible').click({ force: true });
                cy.wait(20000);
            }).then(() => {
                cy.get('@currentProjectId').then((projectId) => {
                  ProjectManager.deleteProject(projectId);
                });
            })
    })
})