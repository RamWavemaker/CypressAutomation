import '@4tw/cypress-drag-drop';
import ProjectWorkspace from './ProjectWorkspace';
import { error } from 'jquery';

const MAIN_CONTENT = "div[name='mainContent']";
const DEAFULT_DRAG = ".app-page-content";
const PREFAB_DRAG = "[name='prefab_container1'][wm-droppable='true']";
const PREFAB_PARTAIL_DRAG = ".wm-partial-page";
class DndWidget {
  searchWidget(widgetName) {
    cy.get("input[name='wm-widgets-filter']").clear().type(widgetName);
  }

  performDndWidget(widgetName,pageType) {
    this.searchWidget(widgetName)
    if(pageType=='PAGE'){
      this.dragAndAssert(widgetName,DEAFULT_DRAG);
    }else if(pageType=='PREFAB'){
      this.dragAndAssert(widgetName,PREFAB_DRAG);
    }else if(pageType=='PREFAB_PARTIAL'){
      this.dragAndAssert(widgetName,PREFAB_PARTAIL_DRAG)
    }else{
      cy.log("unknown pageType");
      return error;
    }
    this.searchWidget(widgetName);
    this.dragAndAssert(widgetName);
    ProjectWorkspace.saveWorkSpace();
    return cy.get('span.dirty-icon').should('not.exist');
  }


  dragAndAssert(widgetName,widgetDropSelector){
    cy.window().then((win) => {
      const script = `
        (function( $ ) {
            $.fn.simulateDragDrop = function(options) {
                return this.each(function() {
                    new $.simulateDragDrop(this, options);
                });
            };
            $.simulateDragDrop = function(elem, options) {
                this.options = options;
                this.simulateEvent(elem, options);
            };
            $.extend($.simulateDragDrop.prototype, {
                simulateEvent: function(elem, options) {
                    var type = 'dragstart';
                    var event = this.createEvent(type);
                    this.dispatchEvent(elem, type, event);

                    type = 'dragover';
                    var dragOverEvent = this.createEvent(type, {});
                    dragOverEvent.dataTransfer = event.dataTransfer;
                    dragOverEvent.dataTransfer.setData('text','__dnd__simulation__');
                    this.dispatchEvent($(options.dropTarget)[0], type, dragOverEvent);

                    type = 'drop';
                    var dropEvent = this.createEvent(type, {});
                    dropEvent.dataTransfer = event.dataTransfer;
                    this.dispatchEvent($(options.dropTarget)[0], type, dropEvent);

                    type = 'dragend';
                    var dragEndEvent = this.createEvent(type, {});
                    dragEndEvent.dataTransfer = event.dataTransfer;
                    this.dispatchEvent(elem, type, dragEndEvent);
                },
                createEvent: function(type) {
                    var event = document.createEvent("CustomEvent");
                    event.initCustomEvent(type, true, true, null);
                    event.dataTransfer = {
                        data: {},
                        setData: function(type, val){
                            this.data[type] = val;
                        },
                        getData: function(type){
                            return this.data[type];
                        }
                    };
                    return event;
                },
                dispatchEvent: function(elem, type, event) {
                    if(elem.dispatchEvent) {
                        elem.dispatchEvent(event);
                    } else if( elem.fireEvent ) {
                        elem.fireEvent("on"+type, event);
                    }
                }
            });
        })(jQuery);
      `;

      // Inject plugin
      win.eval(script);

      // Now execute the drag and drop
      const dragSelector = `li[name="wm-widget-${widgetName}"]`;
      const dropSelector = widgetDropSelector;

      win.$(dragSelector).simulateDragDrop({ dropTarget: win.$(dropSelector) });
    });
  }

  performDndWidgetList(widgetNames){
    
  }
    datatableDrop(widgetName){
    this.performDndWidget(widgetName);
    cy.get("div[name='wms-source-data-source'] input").type('hrdb {enter}');
    cy.get("div[name='wms-source-data-operation'] input").type("User {enter}");
    cy.get("input[name='variable-name-input']").clear().type('user ');
    cy.get("input[name='maxresults-input']").clear().type('2');
    cy.get("[name='btn-next-page']").click();
    cy.get("#wms-tpl-editable-grid").click();
    cy.get("[name='btn-next-page']").click();
    cy.get("#wms-nav-Basic").click();
    cy.get('[name="btn-next-page"]').click();
    cy.get('[name="btn-next-page"]').click();
  }
}

export default new DndWidget();
