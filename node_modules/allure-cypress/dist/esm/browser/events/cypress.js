import { setupScreenshotAttachmentStep, shouldCreateStepFromCommandLogEntry, startCommandLogStep } from "../commandLog.js";
import { reportScreenshot } from "../lifecycle.js";
import { reportStepError } from "../steps.js";
import { getFileNameFromPath } from "../utils.js";
export var registerCypressEventListeners = () => Cypress.on("fail", onFail).on("log:added", onLogAdded);
export var enableReportingOfCypressScreenshots = () => Cypress.Screenshot.defaults({
  onAfterScreenshot
});
var onAfterScreenshot = function onAfterScreenshot() {
  for (var _len = arguments.length, _ref = new Array(_len), _key = 0; _key < _len; _key++) {
    _ref[_key] = arguments[_key];
  }
  var [, {
    name: originalName,
    path
  }] = _ref;
  var name = originalName !== null && originalName !== void 0 ? originalName : getFileNameFromPath(path);
  reportScreenshot(path, name);
  setupScreenshotAttachmentStep(originalName, name);
};
var onLogAdded = (_, entry) => {
  if (shouldCreateStepFromCommandLogEntry(entry)) {
    startCommandLogStep(entry);
  }
};
var onFail = error => {
  reportStepError(error);

  // If there are more "fail" handlers yet to run, it's not our responsibility to throw.
  // Otherwise, we won't give them any chance to do their job (EventEmitter stops executing handlers as soon
  // as one of them throws - that is also true for eventemitter2, which is used by the browser-side of Cypress).
  if (noSubsequentFailListeners()) {
    throw error;
  }
};
var noSubsequentFailListeners = () => Object.is(Cypress.listeners("fail").at(-1), onFail);
//# sourceMappingURL=cypress.js.map