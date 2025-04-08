import 'cypress-xpath';
import LoginPage from './Pages/LoginPage';
import DndWidget from './Pages/DndWidget';
import ProjectWorkspace from './Pages/ProjectWorkspace';
import $ from 'jquery';
import ProjectManager from './Pages/ProjectManager';

describe('WaveMaker Test Suite', () => {
    let cookies = [];
  
    it('1. Login and Save Cookies', () => {
      LoginPage.visit('https://www.wavemakeronline.com');
  
      cy.title().should('eq', 'WaveMaker');

      LoginPage.login('ramcharan.kasinaboina@wavemaker.com','Wavemaker@Ram123');
      cy.url().should('include', '/projects/#/ManageRecents');
      cy.getCookies().then((c) => {
        cookies = c;
      });
    });
  
    it('2. Use Saved Cookies in New Session', () => {
      LoginPage.visit('https://www.wavemakeronline.com');
  
      cookies.forEach((cookie) => {
        cy.setCookie(cookie.name, cookie.value);
      });
  
      cy.reload();
  
      cy.url().should('include', '/projects/#/ManageRecents');
      cy.title().should('eq', 'WaveMaker Studio');
    });
  
    it('Verifies the title', () => {
          LoginPage.visit("https://www.wavemakeronline.com/");
          LoginPage.login('ramcharan.kasinaboina@wavemaker.com','Wavemaker@Ram123');
          let projectName = ProjectManager.create();
          DndWidget.performDndWidget('button');
          ProjectWorkspace.saveWorkSpace();
          cy.url().then((url) => {
            cy.log("Original url is " + url); 
            // After capturing the original URL, perform other actions
            ProjectWorkspace.preview(projectName,"ramcharan.kasinaboina@wavemaker.com","Wavemaker@Ram123");
            cy.get("button[name='button1']").should('be.visible');
          });
      });
  });
  