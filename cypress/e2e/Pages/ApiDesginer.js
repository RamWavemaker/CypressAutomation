import ProjectWorkspace from "./ProjectWorkspace";
class ApiDesigner{

    importRestApi(apiUrl,serviceName,queryParams){
        ProjectWorkspace.goToApiDesigner();
        cy.get('i.button-primary').click();
        cy.get("[name='wm-webservice-rest']").click();
        cy.get("[class='app-dialog-title modal-title']").should('exist');
        cy.get("[name='wm-webservice-sample-url']").last().click().scrollIntoView().clear({ force: true }) .type(apiUrl, { delay: 10 });
        cy.get("[name='wm-webservice-use-proxy']").check();
        // cy.get('input[name="wm-webservice-use-proxy"]').parent().click({ force: true });
        cy.get("[name='wm-webservice-sample-test']").last().click();
        this.setQueryParams(queryParams);
        cy.get("[name='wm-webservice-service-name']").last().clear().type(`${serviceName}`);
        cy.get("[name='wm-webservice-sample-next']").contains(' Import ').last().click();
        cy.get(`[value='${serviceName}']`).should('exist');
    }

    setHeaders(headers){
        if(!headers){
            
        }
    }
    setQueryParams(queryParams){
        if(!queryParams){
            cy.get("button[title='wm-rest-query-params-header']").last().click();
        }
    }
}
export default new ApiDesigner();