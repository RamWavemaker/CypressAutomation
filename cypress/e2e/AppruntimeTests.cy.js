import LoginPage from "./Pages/LoginPage";
import ProjectManager from "./Pages/ProjectManager";
import ProjectWorkspace from "./Pages/ProjectWorkspace";
import DndWidget from "./Pages/DndWidget";
import AppRuntimeUtils from "../utils/AppRuntimeUtils";
import FlakyTestsInSeliniumRunPage from "./RunPages/FlakyTestsInSeliniumRunPage";
import ApiDesginer from "./Pages/ApiDesginer";
import WorkSpacePage from "./Pages/WorkSpacePage";
const getDownloadPath = require("../utils/pathHelper");

const userCredentials = {
  email: 'badrinath.chinta@wavemaker.com',
  password: 'Wavemaker@123'
};

const RUN_COUNT = 1;

for (let i = 1; i <= RUN_COUNT; i++) {
//clean testscases
describe(`Appruntime Testcases-${i}`,()=>{  //${i}
    it(`Localization element intercept`,()=>{
        const fileName = 'WidgetsLocalisationApp.zip';
        cy.log("📦 File name being passed:", fileName);  // ✅ Add this
        const WidgetsLocalisationS3path = "wavemaker-test-apps/AutomationProjects/11.10/WidgetsLocalisationApp";
        // ✅ Use imported helper instead of path.join
        const localDownloadPath = getDownloadPath(fileName);
        cy.log("📁 Resolved download path:", localDownloadPath);
        AppRuntimeUtils.previewAppRuntime(userCredentials.email, userCredentials.password, fileName, WidgetsLocalisationS3path, localDownloadPath, 'PROJECT')
            .then(() => {
                cy.get('select[name="select1"]').select('العربية');
                cy.get('a[name="anchor25"]').click();
                cy.get("div input[name='datetime5']").should('be.visible').click({ force: true });
            }).then(() => {
                cy.get('@currentProjectId').then((projectId) => {
                  ProjectManager.deleteProject(projectId);
                });
            })
    })

    it(`verifyIFrameDialog-${i}`, () => {
      const fileName = 'WidgetsLocalisationApp.zip';
      const WidgetsLocalisationS3path = "wavemaker-test-apps/AutomationProjects/11.10/WidgetsLocalisationApp";
      const localDownloadPath = getDownloadPath(fileName);
      AppRuntimeUtils.previewAppRuntime(userCredentials.email, userCredentials.password, fileName, WidgetsLocalisationS3path, localDownloadPath, 'PROJECT')
        .then(() => {
          FlakyTestsInSeliniumRunPage.verifyIFrameDialog();
        }).then(() => {
          cy.get('@currentProjectId').then((projectId) => {
            ProjectManager.deleteProject(projectId);
          });
        })
    });
  
    it(`verifyPageDialog-${i}`, () => {
      const fileName = 'WidgetsLocalisationApp.zip';
      const WidgetsLocalisationS3path = "wavemaker-test-apps/AutomationProjects/11.10/WidgetsLocalisationApp";
      const localDownloadPath = getDownloadPath(fileName);
      AppRuntimeUtils.previewAppRuntime(userCredentials.email, userCredentials.password, fileName, WidgetsLocalisationS3path, localDownloadPath, 'PROJECT')
        .then(() => {
          FlakyTestsInSeliniumRunPage.verifyPageDialog();
        }).then(() => {
          cy.get('@currentProjectId').then((projectId) => {
            ProjectManager.deleteProject(projectId);
          });
        })
    });

    afterEach(() =>{
      cy.wait(3000);
      const shouldDeleteProjectName = Cypress.env('SHOULDDELETEPROJNAME');
      ProjectManager.deleteCreatedProject(shouldDeleteProjectName);
    })
    
})
}