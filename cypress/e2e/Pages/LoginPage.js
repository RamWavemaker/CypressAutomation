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

    loginApi(username,password){
        return cy.request({
            method: 'POST',
            url: 'https://www.wavemakeronline.com/login/authenticate',
            form: true,
            body: {
              j_username: username,
              j_password: password
            },
            followRedirect: false,
        }).then((response) => {
            expect(response.status).to.eq(302);
            const cookies = response.headers['set-cookie'];
            const jsessionId = cookies
              .find(cookie => cookie.startsWith('JSESSIONID'))
              .split(';')[0];
            const auth_cookie = cookies.find(cookie => cookie.startsWith('auth_cookie')).split(';')[0];
            cy.log(jsessionId);
        
            Cypress.env('CJSESSIONID', jsessionId.split('=')[1]);
            Cypress.env('Cauth_cookie',auth_cookie.split('=')[1]);
        });
    }
}

export default new LoginPage();
