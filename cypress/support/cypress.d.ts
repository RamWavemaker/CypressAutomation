declare namespace Cypress {
    interface Chainable {
      /**
       * Custom command to simulate drag-and-drop.
       * @param sourceSelector - Selector for the draggable element.
       * @param targetSelector - Selector for the drop target.
       */
      simulateDragDrop(sourceSelector: string, targetSelector: string): Chainable<any>;
    }
  }
  