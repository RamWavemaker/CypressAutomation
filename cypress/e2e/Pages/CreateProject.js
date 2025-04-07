
class CreateProject{
    clickAppsTab() {
        cy.get("a[name='appsLink']").should('be.visible').should('not.be.disabled').click();
    }

    generateProjectName(){
        const randomName = Math.random().toString(36).substring(2, 8);
        return`Cy_${randomName}`;
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
        cy.wait(5000);
        return projectName;
    }
}
export default new CreateProject();