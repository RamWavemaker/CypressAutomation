import LoginPage from "./LoginPage";
class ProjectWorkspace{
    saveWorkSpace(){
        cy.get("[name='wm-save-design-workspace']").click();
    }

    preview(projectName,userEmail,userPassword) {
        cy.url().then((currentUrl) => {
            const urlParams = new URLSearchParams(new URL(currentUrl).search);
            const projectId = urlParams.get('project-id');
    
            if (projectId) {
                const apiUrl = `https://www.wavemakeronline.com/studio/services/projects/${projectId}/deployment/inplaceDeploy`;
    
                cy.request({
                    method: 'POST',
                    url: apiUrl,
                    body: {},
                    headers: {
                        "Content-Type": "application/json",
                    },
                    auth: {
                        username: userEmail,
                        password: userPassword,
                    },
                }).then((response) => {
                    // Handle the response from the API
                    cy.log('API Response:', response.body);
                    expect(response.status).to.eq(200); // Assert the response status
                    
                    // Extract the preview URL from the response
                    const previewUrl = response.body.result;
                    cy.log('Extracted result:', previewUrl);
                    // Ensure LoginPage.login is called only after previewUrl is set
                    const fullPreviewUrl = previewUrl.startsWith('http') ? previewUrl : `https:${previewUrl}`;
                    cy.log('Final Preview URL:', fullPreviewUrl);
                    cy.window().then((win) => {
                        cy.visit(fullPreviewUrl, { failOnStatusCode: false });
                    });
                });
            } else {
                cy.log('project-id not found in the current URL');
            }
        });
    }
    
    goToPages(){
        cy.get("[name='wm-category-pages']").click();
    }

    goToDatabase(){
        cy.get("[name='wm-category-databases']").click();
    }

    goToJavaServices(){
        cy.get("[name='wm-category-java-services']").click();
    }

    goToApiDesigner(){
        cy.get("[name='wm-category-apis']").click();
    }

    goToSettings(){
        cy.get("[name='wm-category-settings']").click();
    }

}
export default new ProjectWorkspace();