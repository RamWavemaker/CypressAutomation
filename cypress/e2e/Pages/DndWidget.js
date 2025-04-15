import '@4tw/cypress-drag-drop';

const MAIN_CONTENT = "div[name='mainContent']";

class DndWidget {
    searchWidget(widgetName) {
        cy.get("input[name='wm-widgets-filter']").type(widgetName);
    }

    dragAndAssert(widgetName) {
        cy.window().then((win) => {
            if (!win.jQuery) {
                throw new Error("jQuery is not available in the Cypress test environment.");
            }

            // Define jQuery plugin for drag and drop
            win.jQuery.fn.simulateDragDrop = function (options) {
                return this.each(function () {
                    new win.jQuery.simulateDragDrop(this, options);
                });
            };

            win.jQuery.simulateDragDrop = function (elem, options) {
                this.options = options;
                // @ts-ignore
                this.simulateEvent(elem, options);
            };

            win.jQuery.simulateDragDrop.prototype.simulateEvent = function (elem, options) {
                let dataTransfer = new DataTransfer();

                // Simulating drag start
                this.dispatchEvent(elem, "dragstart", dataTransfer);

                // Simulating drag over
                this.dispatchEvent(win.jQuery(options.dropTarget)[0], "dragover", dataTransfer);

                // Simulating drop
                this.dispatchEvent(win.jQuery(options.dropTarget)[0], "drop", dataTransfer);

                // Simulating drag end
                this.dispatchEvent(elem, "dragend", dataTransfer);
            };

            win.jQuery.simulateDragDrop.prototype.dispatchEvent = function (elem, type, dataTransfer) {
                if (!elem) {
                    throw new Error(`Element for ${type} event is undefined.`);
                }

                let event = new DragEvent(type, {
                    bubbles: true,
                    cancelable: true,
                    dataTransfer: dataTransfer
                });

                elem.dispatchEvent(event);
            };

            // Execute the drag and drop
            win.jQuery(`li[data-widget-type='wm-${widgetName}']`).simulateDragDrop({
                dropTarget: win.jQuery(".app-page-content"),
            });
        });
    }

    performDndWidget(widgetName) {
        this.searchWidget(widgetName);
        this.dragAndAssert(widgetName);
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
