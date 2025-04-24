import ProjectManager from '../e2e/Pages/ProjectManager';
import ProjectWorkspace from '../e2e/Pages/ProjectWorkspace'
import LoginPage from '../e2e/Pages/LoginPage';

class AppRuntimeUtils{

  previewAppRuntime(userEmail,userPassword,fileName,s3path,localdownloadPath,projectType){
    const WidgetsLocalisationS3path = `jira/wavemaker-test-apps/AutomationProjects/11.10/WidgetsLocalisationApp/WidgetsLocalisationApp.zip`;
    const localDownloadPath = `/${localdownloadPath}//${fileName}`;
    return LoginPage.loginApi(userEmail,userPassword)
    .then(()=>{
      return cy.task('downloadFileFromS3', {
        key: WidgetsLocalisationS3path,
        downloadPath: localDownloadPath
      })
    }) // Step 3: Download file from S3
    .then((message) => {
      cy.log(message);
      // Step 4 (Optional): Verify that the file was actually downloaded
      return cy.task('fileExists', localDownloadPath).should('eq', true);
    }).then(()=>{
      // let projectName = ProjectManager.generateProjectName();
      let projectName = ProjectManager.generateZipProjectName(fileName.replace(/\.zip$/i, ''));
      return ProjectManager.importWavemakerProject(fileName,projectType,projectName);
    })
    .then((studioProjectId)=> {
      cy.log(`🎯 Studio Project ID is: ${studioProjectId}`);
      return ProjectManager.projectDetails(studioProjectId);
    }).then(()=>{
      return cy.get('@studioProjectDetails');
    }).then((project) =>{
      return ProjectWorkspace.previewApi(project.id,userEmail,userPassword);
    });
  }
}
export default new AppRuntimeUtils();