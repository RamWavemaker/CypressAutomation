import '@4tw/cypress-drag-drop'
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/// <reference types="cypress" />

/// <reference types="cypress-xpath" />

Cypress.Commands.add("simulateDragDrop", (sourceSelector, targetSelector) => {
    cy.window().then((win) => {
        if (!win.jQuery) {
            throw new Error("jQuery is not loaded in the Cypress window!");
        }

        if (!win.jQuery.fn.simulateDragDrop) {
            win.jQuery.fn.simulateDragDrop = function (options) {
                return this.each(function () {
                    new win.jQuery.simulateDragDrop(this, options);
                });
            };

            win.jQuery.simulateDragDrop = function (elem, options) {
                let self = win.jQuery.simulateDragDrop.prototype;

                //  Create a reusable dataTransfer object
                let dataTransfer = new DataTransfer();
                dataTransfer.setData("text/plain", "__dnd__simulation__");

                //  Create drag events with dataTransfer included
                let dragStartEvent = self.createDragEvent("dragstart", dataTransfer);
                self.dispatchEvent(elem, "dragstart", dragStartEvent);

                let dragOverEvent = self.createDragEvent("dragover", dataTransfer);
                self.dispatchEvent(win.jQuery(options.dropTarget)[0], "dragover", dragOverEvent);

                let dropEvent = self.createDragEvent("drop", dataTransfer);
                self.dispatchEvent(win.jQuery(options.dropTarget)[0], "drop", dropEvent);

                let dragEndEvent = self.createDragEvent("dragend", dataTransfer);
                self.dispatchEvent(elem, "dragend", dragEndEvent);
            };

            win.jQuery.simulateDragDrop.prototype = {
                createDragEvent: function (type, dataTransfer) {
                    return new DragEvent(type, {
                        bubbles: true,
                        cancelable: true,
                        dataTransfer: dataTransfer, // ✅ Pass dataTransfer here
                    });
                },
                dispatchEvent: function (elem, type, event) {
                    if (elem.dispatchEvent) {
                        elem.dispatchEvent(event);
                    } else if (elem.fireEvent) {
                        elem.fireEvent("on" + type, event);
                    }
                },
            };
        }

        // Perform the drag-and-drop action
        cy.get(sourceSelector).then(($source) => {
            cy.get(targetSelector).then(($target) => {
                win.jQuery($source).simulateDragDrop({ dropTarget: $target });

                // ✅ Ensure Cypress waits for the drop to complete
                cy.wrap($target).should("contain", $source.text().trim());
            });
        });
    });
});
