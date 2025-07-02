const languages  = ['Afrikaans', 'العربية', 'Deutsch','English','español','français','हिंदी','తెలుగు'];
class FlakyTestsInSeliniumRunPage{

    clickLeftPanel(pageName){
        cy.get(`[aria-label='${pageName}']`).click();   
    }

    verifyIFrameDialog(){
        for (let i = 0; i < languages.length; i++) {
            this.assertIframeDialog(languages[i]);
        }
    }

    assertIframeDialog(language){
        this.clickLeftPanel('Iframe');
        cy.get("select[name='select1']").select(`${language}`);
        cy.getIframeBody('iframe[name="iframe1"]').within(() => {
            cy.get("[class='main-wrapper mainWrapper_z2l0'] h1").eq(0).should('exist');
        });
    }

    verifyPageDialog(){
        const headings = ['werknemer data','بيانات الموظف','Mitarbeiterdaten','Employee Data','datos empleado','données employé','कर्मचारी डेटा','ఉద్యోగి సమాచారం'];
        const descriptions = ['Lys','قائمة','Liste','List','Lista','Liste','सूची','జాబితా'];
        const okayButtons = ['Goed','موافق','Ordnung','Ok','Aceptar',"D'accord",'ठीक है','సరే'];
        for (let i = 0; i < languages.length; i++) {
            this.assertPageDialog(languages[i],headings[i],descriptions[i],okayButtons[i]);
        }
    }

    assertDialogScenario(language,heading,description,okayButton){
        this.clickLeftPanel('Dialog');
        cy.get("select[name='select1']").select(`français`);
        cy.get("select[name='select1']").select(`English`);
        cy.get("[name='button2']").click();
        cy.get(`[aria-label="Ok"]`).should('exist').click();
        cy.get("[name='button8']").click();
        cy.get(`[aria-label="Ok"]`).should('exist').click();
    }


    assertPageDialog(language,heading,description,okayButton){
        this.clickLeftPanel('Dialog');
        cy.get("select[name='select1']").select(`${language}`);
        cy.get("[name='button5']").click();
        cy.get("div[class='heading']").contains(`${heading}`).should('exist'); //heading
        cy.get("[class='description']").contains(`${description}`).should('exist'); // description
        cy.get("p[name='Name']").contains('Chris').should('exist');
        cy.get(`[aria-label="${okayButton}"]`).should('exist').click();  //Okay button
    }
}
export default new FlakyTestsInSeliniumRunPage();