class LoginPage {
    visit(pageName) {
        cy.visit(pageName, { failOnStatusCode: false });
    }

    enterEmail(email) {
        cy.get('#email').should('be.visible').type(email);
    }

    enterPassword(password) {
        cy.get('#password').should('be.visible').type(password);
    }

    clickLogin() {
        cy.get('button[type="submit"]').click();
    }

    basicPreviewLogin(username,password){
        cy.get("input[name='j_username']").type(username);
        cy.get("input[name='j_password']").type(password);
        cy.get("[name='loginButton']").click();
    }

    login(email, password) {
        this.enterEmail(email);
        this.enterPassword(password);
        this.clickLogin();
    }
}

export default new LoginPage();
