import LoginPage from "./LoginPage";

//locators 
const SAVE_WORKSPACE = "[name='wm-save-design-workspace']";
const PAGES = "[name='wm-category-pages']";
const DATABASE = "[name='wm-category-databases']";
const JAVA_SERVICE = "[name='wm-category-java-services']";
const API_DESIGNER = "[name='wm-category-apis']";
const SETTINGS = "[name='wm-category-settings']";
const SEARCH_WIDGET_FIELD = '[name="widget-search-search-field"]';
const PROPERTY_LOCATOR = (name) => `[data-identifier='property-${name}']`;
const PROPERTY_BIND_LOCATOR = (name) => `[name='wm-bind-property-${name}']`;

class ProjectWorkspace{
    saveWorkSpace(){
        cy.get(SAVE_WORKSPACE).click();
    }

    goToPages(){
        cy.get(PAGES).click();
    }

    goToDatabase(){
        cy.get(DATABASE).click();
    }

    goToJavaServices(){
        cy.get(JAVA_SERVICE).click();
    }

    goToApiDesigner(){
        cy.get(API_DESIGNER).click();
    }

    goToSettings(){
        cy.get(SETTINGS).click();
    }

    saveWorkSpaceApi(pageName,userEmail,userPassword){
        cy.url().then((currentUrl) => {
            const urlParams = new URLSearchParams(new URL(currentUrl).search);
            const projectId = urlParams.get('project-id');
    
            if (projectId) {
                const apiUrl = `https://www.wavemakeronline.com/studio/services/projects/${projectId}/pages/${pageName}/${pageName}.html`;
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
                });
            } else {
                cy.log('project-id not found in the current URL');
            }
        });
    }

    preview(userEmail,userPassword) {
        cy.url().then((currentUrl) => {
            const urlParams = new URLSearchParams(new URL(currentUrl).search);
            const projectId = urlParams.get('project-id');
    
            if (projectId) {
                this.previewApi(projectId,userEmail,userPassword);
            } else {
                cy.log('project-id not found in the current URL');
            }
        });
    }
    
    setBindings(widgetName,BindType,propertName,propertyValue,widgetPropertyGroup){
        cy.xpath("//span[@class='wm-heading' and text()='Page Structure']").click();
        cy.get("[name='wm-widget-group-widgets-tree'] input").type(widgetName);
        cy.get(`a[data-searchkey='${widgetName}']`).click();
        switch (BindType) {
            case 'TEXT_BOX':
                this.setWidgetPropertyInTextBox(propertName,propertyValue,widgetPropertyGroup);
                break;
            case 'BIND':
                this.setWidgetPropertyThroughBindButton(propertName,propertyValue,widgetPropertyGroup);
                break;
            default:
                console.log("Unknown binding type:", BindType);
                break;
        }
    }

    setWidgetPropertyInTextBox(propertName,propertyValue,widgetPropertyGroup){
        cy.get(`i[title="${widgetPropertyGroup}"]`).click();
        cy.get(PROPERTY_LOCATOR(propertName)).clear().type(`${propertyValue}{enter}`);
    }

    setWidgetPropertyThroughBindButton(propertName,propertyValue,widgetPropertyGroup){
        cy.get(`i[title="${widgetPropertyGroup}"]`).click();
        cy.get(PROPERTY_BIND_LOCATOR(propertName)).click();
        cy.get('span').contains('Use Expression').should('exist').click();
        cy.get('div.wm-code-editor, div.monaco_editor_content').last().click();
        this.enterTextInMonacoEditor(propertyValue);
        cy.get('div.wm-code-editor, div.monaco_editor_content').last().click();
        cy.get("[name='wm-apply-format-btn']").click();
        cy.get("button[title='Bind']").click();
    }


    enterTextInMonacoEditor(properValue){
        const propertyValue = ``; // your value here

        const escapedValue = propertyValue
        .replace(/\n/g, '\\n')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');

        const jsToExecute = `
        var editorLength = window.monaco.editor.getEditors().length;
        window.monaco.editor.getEditors()[editorLength - 1].setValue("${escapedValue}");
        `;       

        cy.window().then((win) => {
            win.eval(jsToExecute);
        });
    }

    previewApi(projectId,userEmail,userPassword){
        const apiUrl = `https://www.wavemakeronline.com/studio/services/projects/${projectId}/deployment/inplaceDeploy`;
        const jsessionId = Cypress.env('CJSESSIONID');
        const auth_cookie = Cypress.env('Cauth_cookie');
        return cy.request({
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
            if (response.status !== 200) {
                throw new Error(`Deployment failed: ${response.body.errors?.error?.[0]?.message || 'Unknown error'}`);
            }
            cy.log('API Response:', response.body);
            expect(response.status).to.eq(200); 
             // Assert the response status
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
    }

    addDataBase(databaseName){
        this.goToDatabase();
        cy.get('i[title="Design Data Model"]').click();
        cy.get("div[name='wm-database-import']").click();
        if(databaseName.includes("HR")){
            cy.get('a[name="wm-database-sample-db"]').contains('sample HR database').click();
        }
        cy.get("[name='wm-db-increment-step']").should('be.visible').should('be.enabled').click();
        cy.get("button[name='wm-open-db-designer']").should('be.visible').click();
        this.goToPages();
    }

    openPageStructureAndSearchWidget(widgetName) {
        // Target the expand button for Page Structure
        cy.get("[name='wm-widget-group-widgets-tree'] button[name='wm-expand-widget-accordian-btn']")
          .invoke('attr', 'class')
          .then((classAttr) => {
            if (!classAttr.includes('wms-caret-down')) {
              // Click to expand the tab
              cy.get("[name='wm-widget-group-widgets-tree'] span").click();
            }
      
            // Type widget name in the search field
            cy.get(SEARCH_WIDGET_FIELD).clear().type(widgetName);
            cy.get(`a[data-searchkey='${widgetName}']`).click();
        });
    }

    setProperty(widgetName,propertName,propertyValue){
        this.openPageStructureAndSearchWidget(widgetName);
    }
}
export default new ProjectWorkspace();