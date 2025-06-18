class WorkSpacePage{
    openVariableDialog(){
        cy.get("[name='wm-header-variables']").click();
        cy.get('span.dropdown-item').contains('Variables').click();
    }
}
export default new WorkSpacePage();