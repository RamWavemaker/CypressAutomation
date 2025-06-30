import 'cypress-xpath';
import LoginPage from './Pages/LoginPage';
import DndWidget from './Pages/DndWidget';
import ProjectWorkspace from './Pages/ProjectWorkspace';
import $ from 'jquery';
import ProjectManager from './Pages/ProjectManager';
//clean
const RUN_COUNT = 1;

for (let i = 1; i <= RUN_COUNT; i++) {
describe(`WaveMaker Test Suite-${i}`, () => {
    let cookies = [];
    const userCredentials = {
      email: 'test.automate11@wavemaker.com',
      password: 'Wavemaker@123'
    };
  
    before(`1. Login and Save Cookies-${i}`, () => {
      LoginPage.visit('https://www.wavemakeronline.com');
  
      cy.title().should('eq', 'WaveMaker');

      LoginPage.login(userCredentials.email,userCredentials.password);
      cy.url().should('include', '/projects/#/ManageRecents');
      cy.getCookies().then((c) => {
        cookies = c;
      });

      cy.getCookie('JSESSIONID').then((cookie) => {
        Cypress.env('CJSESSIONID', cookie.value);
      });

    });
  
    beforeEach(`2. Use Saved Cookies in New Session-${i}`, () => {
      LoginPage.visit('https://www.wavemakeronline.com');
  
      cookies.forEach((cookie) => {
        cy.setCookie(cookie.name, cookie.value);
      });
  
      cy.reload();
  
      cy.url().should('include', '/projects/#/ManageRecents');
      cy.title().should('eq', 'WaveMaker Studio');
    });


    let projectName = null;
    it(`Verifies the title-${i}`, () => {
          LoginPage.visit("https://www.wavemakeronline.com/");
          projectName = ProjectManager.create();
          DndWidget.performDndWidget('button','PAGE');
          ProjectWorkspace.saveWorkSpace();
          cy.url().then((url) => {
            cy.log("Original url is " + url); 
            // After capturing the original URL, perform other actions
            ProjectWorkspace.preview(userCredentials.email,userCredentials.password);
            cy.get("button[name='button1']").should('be.visible');
          })
      });

      after(() =>{
        if(projectName != null){
          cy.wait(2000);
          ProjectManager.deleteCreatedProject(projectName);
        }
      })
  });
}