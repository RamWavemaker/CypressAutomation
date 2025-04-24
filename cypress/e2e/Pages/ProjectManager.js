class ProjectManager {

    clickAppsTab() {
        cy.get("a[name='appsLink']").should('be.visible').should('not.be.disabled').click();
    }
    
    generateProjectName(){
        const randomName = Math.random().toString(36).substring(2, 8);
        return`Cy_${randomName}`;
    }

    generateZipProjectName(projectName){
        return `Cy_${projectName}`;
    }

    create(){
        this.clickAppsTab();
        cy.get("button[name='buttonApplicationCreate']").should('be.visible').click();
        cy.xpath("//li[contains(@class, 'app-list-item')]//h2[text()='Web']").click();
        cy.get("[aria-label='Continue']").click();
        const projectName = this.generateProjectName();
        cy.get("wm-input[name='textBoxProjectName_formWidget'] input").type(projectName);
        cy.get("[aria-label='Continue']").click();
        cy.get('button[name="doneBtn_wizardCreateProject"]').click();
        cy.get("div[class='wm-application-view']").should('be.visible');
        return projectName;
    }

    createPrefab(){
      cy.get("a[name='prefabsLink']").should('be.visible').should('not.be.disabled').click();
      cy.get("[name='buttonCreatePrefab']").should('be.visible').click();
      const projectName = this.generateProjectName();
      cy.get("input[name='textBoxProjectName_formWidget']").should('be.visible').type(projectName);
      cy.get("textarea[name='description_formWidget']").should('be.visible').type(projectName);
      cy.get("button[name='nextBtn_wizardCreatePrefab']").should('be.visible').click();
      cy.get("button[name='doneBtn_wizardCreatePrefab']").should('be.visible').click();
      return projectName;
    }

    projectDetails(studioProjectId) {
        const url = `https://www.wavemakeronline.com/studio/services/projects/${studioProjectId}/details`;
        return cy.request({
            method: 'GET',
            url,
        }).then(response => {
            expect(response.status).to.eq(200);
            const project = response.body;
    
            // Log essential details
            cy.log(`Studio Project ID: ${project.id}`);
            cy.log(`Name: ${project.name}`);
            cy.log(`Display Name: ${project.displayName}`);
            cy.log(`Branch: ${project.vcsBranchId}`);
            cy.log(`Version: ${project.version}`);
            cy.log(`Platform Version: ${project.platformVersion}`);
            cy.log(`Theme: ${project.activeTheme}`);
            cy.log(`Template: ${project.template}`);
    
            // If chaining or needing this info later, you can return or alias
            cy.wrap(project).as('studioProjectDetails');
        });
    }
    

    importWavemakerProject( fileName, packageType = 'PROJECT', packageName) {
        const url = `https://www.wavemakeronline.com/edn-services/rest/projects/import?packageType=${packageType}`;
        const downloadPath = `cypress/downloads/${fileName}`;
        const jsessionId = Cypress.env('CJSESSIONID');
        let projectId = '';
        return cy.readFile(downloadPath, 'binary')
          .then(Cypress.Blob.binaryStringToBlob)
          .then(fileContent => {
            const formData = new FormData();
            formData.append('file', fileContent, fileName);
            formData.append('Content-Type', 'application/x-zip-compressed');
            formData.append('packageName', packageName);
            formData.append('displayName', packageName);
      
            return cy.request({
              method: 'POST',
              url,
              body: formData,
              headers: {
                'Cookie': `JSESSIONID=${jsessionId}`,
              },
              form: false,
              encoding: 'utf8' 
            });
          })
          .then(response => {
            if (response.status === 409) {
               cy.log('Project already exists or conflict occurred.');
            } else {
               cy.log('Import successful.');
            }
            const decoder = new TextDecoder('utf-8');
            const jsonString = decoder.decode(response.body);
            cy.log(`jsonString is -- ${jsonString}`);
            const parsedBody = JSON.parse(jsonString);
            cy.log(`Json bosy is --- ${parsedBody}`);
            const studioProjectId = parsedBody.studioProjectId;
            cy.wrap(parsedBody.projectId).as('currentProjectId');
            cy.log(`studioproject Id is -- ${studioProjectId}`);
            
            return cy.wrap(studioProjectId);
          });
    }

    deleteProject(projectId) {
      const url = `https://www.wavemakeronline.com/projects/services/ednservices/rest/projects/${projectId}`;
      const jsessionId = Cypress.env('CJSESSIONID');
      return cy.request({
        method: 'DELETE',
        url,
        headers: {
          'Cookie': `JSESSIONID=${jsessionId}`,
        }
      }).then(response => {
        if (response.status === 200) {
          cy.log(` Project ${projectId} deleted successfully.`);
        } else {
          cy.log(`⚠️ Failed to delete project ${projectId}. Status: ${response.status}`);
          console.warn('Delete project error:', response.body);
        }
        return cy.wrap(response.body);
      });
    }
    
      
}

export default new ProjectManager();
