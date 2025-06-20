import LoginPage from "./Pages/LoginPage";
import ProjectManager from "./Pages/ProjectManager";
import ProjectWorkspace from "./Pages/ProjectWorkspace";
import DndWidget from "./Pages/DndWidget";
import AppRuntimeUtils from "../utils/AppRuntimeUtils";
import FlakyTestsInSeliniumRunPage from "./RunPages/FlakyTestsInSeliniumRunPage";
import ApiDesginer from "./Pages/ApiDesginer";
import WorkSpacePage from "./Pages/WorkSpacePage";

const userCredentials = {
  email: 'ramcharan.kasinaboina@wavemaker.com',
  password: 'Wavemaker@Ram123'
};
//clean
// const RUN_COUNT = 20;

let projectName = null;

// for (let i = 1; i <= RUN_COUNT; i++) {
describe(`WidgetPropertiesTest`, () => { //${i}

  beforeEach(() => {

    cy.session(
      [userCredentials.email, userCredentials.password],
      () => {
        LoginPage.visit("https://www.wavemakeronline.com/");
        LoginPage.login(userCredentials.email, userCredentials.password);
      }
    );

    cy.getAllCookies().then((cookies) => {
      cy.log(JSON.stringify(cookies, null, 2));
    });

    cy.getCookie('JSESSIONID').then((cookie) => {
      Cypress.env('CJSESSIONID', cookie.value);
    });

  });

  it(`selectFirstRecordInMultiSelect`, () => {
    LoginPage.visit("https://www.wavemakeronline.com/");
    projectName = ProjectManager.create();
    ProjectWorkspace.addDataBase('HRDB');
    DndWidget.datatableDrop('table');
    ProjectWorkspace.openPageStructureAndSearchWidget('UserTable1');
    cy.get("[data-identifier='property-advancedsettings']").click();
    cy.get('#toggle-checkbox-property-multiselect-table-Ads').check({ force: true });
    cy.get('#toggle-checkbox-property-gridfirstrowselect-table-Ads').check({ force: true });
    cy.get("wms-dialog-footer button[title='Save']").click();
    ProjectWorkspace.saveWorkSpace();
    cy.get('span.dirty-icon').should('not.exist');
    cy.url().then((url) => {
      ProjectWorkspace.preview(userCredentials.email, userCredentials.password);
      cy.get('tr[data-row-id="0"] input[type="checkbox"]').should('be.checked');
      cy.get("div[name='UserTable1'] .app-datagrid-paginator a").contains('2').click();
      cy.get("tr[data-row-id='0'] input[type='checkbox']").should('not.be.checked');
      cy.get("div[name='UserTable1'] .app-datagrid-paginator a").contains('1').click();
      cy.get("tr[data-row-id='0'] input[type='checkbox']").should('be.checked');
      cy.visit(url, { failOnStatusCode: false });
    }).then(() => {
      // ✅ Cleanup step
      ProjectManager.deleteCreatedProject(projectName);
    });
  });
})


describe(`ImportSampleDBTest`, () => {
  beforeEach(() => {

    cy.session(
      [userCredentials.email, userCredentials.password],
      () => {
        LoginPage.visit("https://www.wavemakeronline.com/");
        LoginPage.login(userCredentials.email, userCredentials.password);

      }
    );

    cy.getAllCookies().then((cookies) => {
      cy.log(JSON.stringify(cookies, null, 2));
    });

    cy.getCookie('JSESSIONID').then((cookie) => {
      Cypress.env('CJSESSIONID', cookie.value);
    });

  });
  it(`verifyHrdbDBCrudOperations`, () => {   //success
    cy.visit("https://www.wavemakeronline.com/");
    projectName = ProjectManager.create();
    DndWidget.performDndWidget('label','PAGE');
    ProjectWorkspace.addDataBase('HRDB');
    DndWidget.performDndWidget('table', 'PAGE');
    cy.get("div[name='wms-source-data-source'] input").type('hrdb {enter}');
    cy.get("div[name='wms-source-data-operation'] input").type("User {enter}");
    cy.get("input[name='variable-name-input']").clear().type('user ');
    cy.get("input[name='maxresults-input']").clear().type('20');
    cy.get("[name='btn-next-page']").click();
    cy.get('[aria-label="Tabs"] a span').contains('Editable').click();
    cy.get("[id='wms-tpl-grid-form-dialog']").click();
    cy.get("[name='btn-next-page']").click();
    cy.get("[id='wms-nav-Basic']").click();
    cy.get("[name='btn-next-page']").click();
    cy.get("[name='btn-next-page']").click();
    cy.get("[id='wms-tpl-two-column']").click();
    cy.get("[name='btn-next-page']").click();
    cy.get("[name='btn-next-page']").click(); //done button
    ProjectWorkspace.saveWorkSpace();
    cy.get('span.dirty-icon').should('not.exist');
    cy.url().then((url) => {
      ProjectWorkspace.preview(userCredentials.email, userCredentials.password);
      cy.wait(3000);
      cy.get('button[aria-label="New"]').click();
      cy.xpath("//div[@class='status']//i[@class='fa fa-circle-o-notch fa-spin']").should('not.exist');
      cy.get("input[name='username_formWidget']").should('be.enabled').clear().type('RamCharan');
      cy.get('button[name="save"]').click();
      cy.get("td[title='RamCharan']").should('exist');
      cy.get('[data-row-id="5"] button.edit-row-button').click();
      cy.get("input[name='username_formWidget']").clear().type('Badri {enter}');
      cy.get("td[title='Badri']").should('exist');
      cy.get('[data-row-id="5"] button.delete-row-button').click();
      cy.get('button.ok-action').click();
      cy.get('[data-row-id="5"]').should('not.exist');
      cy.visit(url, { failOnStatusCode: false });
    }).then(() => {
      // ✅ Cleanup step
      ProjectManager.deleteCreatedProject(projectName);
    });
  });
})


describe(`RestServiceTest`, () => {
  beforeEach(() => {

    cy.session(
      [userCredentials.email, userCredentials.password],
      () => {
        LoginPage.visit("https://www.wavemakeronline.com/");
        LoginPage.login(userCredentials.email, userCredentials.password);

      }
    );

    cy.getAllCookies().then((cookies) => {
      cy.log(JSON.stringify(cookies, null, 2));
    });

  });
  it(`importRestServiceWebApp`, () => {
    LoginPage.visit("https://www.wavemakeronline.com/");
    projectName = ProjectManager.create();
    ApiDesginer.importRestApi('https://maps.googleapis.com/maps/api/directions/xml?origin=Toronto&destination=Montreal&sensor=false', 'googleapis', null);
    ApiDesginer.importRestApi('https://api.fda.gov/drug/event.json?search=patient.drug.openfda.pharm_class_epc:"nonsteroidal+anti-inflammatory+drug"&count=patient.reaction.reactionmeddrapt.exact', 'fdaservice', null);
    ProjectWorkspace.goToPages();
    DndWidget.performDndWidgetList(['label','label','label','label'],'PAGE');
    ProjectWorkspace.saveWorkSpace();
    cy.get('span.dirty-icon').should('not.exist');
    WorkSpacePage.openVariableDialog();
    cy.get("[name='wm-addvariable-add-btn']").click();  //create new Variable 
    cy.get("p.wm-tile-name").contains('Web Service').click();
    cy.get("[name='wm-addvariable-property-service-typeahead-field']").type('googleapis {enter}');
    cy.get("input[id='wm-addvariable-property-name']").clear().type('googleApi')//variableName
    cy.get('select[name="wm-addvariable-property-owner"]').select('Page');
    cy.get("button[name='wm-addvariable-save_close']").contains('Done').click();
    cy.get("[name='wm-addvariable-property-autoUpdate']").uncheck();
    cy.get("[name='wm-addvariable-property-startUpdate']").check();
    cy.get("[name='wm-addvariable-save']").click();   //variable save button
    cy.get("span").contains('Saving variables...').should('not.exist');
    cy.get("div[class='item'] div").contains('googleApi').should('exist');
    cy.get("[name='wm-addvariable-add-btn']").click();  //create new Variable 
    cy.get("p.wm-tile-name").contains('Web Service').click();
    cy.get("[name='wm-addvariable-property-service-typeahead-field']").clear().type('fdaservice {enter}');
    cy.get("input[id='wm-addvariable-property-name']").clear().type('fdaService')//variableName
    cy.get('select[name="wm-addvariable-property-owner"]').select('Page');
    cy.get("button[name='wm-addvariable-save_close']").contains('Done').click();
    cy.get("[name='wm-addvariable-property-autoUpdate']").uncheck();
    cy.get("[name='wm-addvariable-property-startUpdate']").check();
    cy.get("[name='wm-addvariable-save']").click();   //variable save button
    cy.get("span").contains('Saving variables...').should('not.exist');
    cy.get("div[class='item'] div").contains('fdaService').should('exist');
    cy.get("[name='wm-addvariable-save_close']").click();

    //bindings
    ProjectWorkspace.setBindings('label1', 'TEXT_BOX', 'caption', 'Google maps response', 'Properties');
    ProjectWorkspace.setBindings('label2', 'BIND', 'caption', 'Variables.googleApi.dataSet.status', 'Properties');
    ProjectWorkspace.setBindings('label3', 'TEXT_BOX', 'caption', 'Fda service response', 'Properties');
    ProjectWorkspace.setBindings('label4', 'BIND', 'caption', 'Variables.fdaService.dataSet.meta.terms', 'Properties');
    ProjectWorkspace.saveWorkSpace();
    cy.get('span.dirty-icon').should('not.exist');
    //verify in preview
    cy.url().then((url) => {
      ProjectWorkspace.preview(userCredentials.email, userCredentials.password);
    }).then(() => {
      // ✅ Cleanup step
      ProjectManager.deleteCreatedProject(projectName);
    });
  })
});


afterEach(() =>{
  if(projectName!=null){
    cy.wait(2000);
    ProjectManager.deleteCreatedProject(projectName);
  }
})
// }