"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stopCurrentAllureApiStep = exports.stopAllSteps = exports.startAllureApiStep = exports.resolveStepStatus = exports.reportStepError = exports.pushAllureStep = exports.isLogStep = exports.isApiStep = exports.findAndStopStepWithSubsteps = exports.finalizeSteps = exports.ALLURE_STEP_CMD_SUBJECT = void 0;
var _allureJsCommons = require("allure-js-commons");
var _sdk = require("allure-js-commons/sdk");
var _utils = require("../utils.js");
var _lifecycle = require("./lifecycle.js");
var _state = require("./state.js");
var _utils2 = require("./utils.js");
var ALLURE_STEP_CMD_SUBJECT = exports.ALLURE_STEP_CMD_SUBJECT = {};
var isApiStep = descriptor => {
  return descriptor.type === "api";
};
exports.isApiStep = isApiStep;
var isLogStep = descriptor => {
  return descriptor.type === "log";
};
exports.isLogStep = isLogStep;
var startAllureApiStep = name => (0, _lifecycle.reportStepStart)(pushAllureStep(), name);
exports.startAllureApiStep = startAllureApiStep;
var pushAllureStep = () => {
  var id = (0, _utils2.generateApiStepId)();
  (0, _state.pushStep)({
    id,
    type: "api"
  });
  return id;
};
exports.pushAllureStep = pushAllureStep;
var reportStepError = error => {
  var status = (0, _sdk.getStatusFromError)(error);
  var statusDetails = (0, _sdk.getMessageAndTraceFromError)(error);

  // Cypress will abort the test/hook execution soon. No subsequent commands will be run, including the ones that
  // have been scheduled by `allure.step` to stop the currently running steps.
  // Additionally, we can't tell in advance if the current command log steps will be stopped normally or not.
  //
  // Given that, this function will stop all consecutive Allure API steps at the tip of the step stack.
  // The command log steps will be given a chance to stop normally to get the most correct timings.
  //
  // The command log steps that won't stop normally (and Allure API substeps thereof) will be stopped during the
  // test/hook finalization phase.
  stopAllureApiStepStackTip(status, statusDetails);

  // It's not guaranteed for command log steps and intermediate Allure API steps to have access to the error at the
  // moment they are stopped.
  // Additionally, Cypress may not update the stack trace of the error at that time. Until that happens, the stack
  // trace points deep in the bundled code, which is little to no use for the user. Therefore, we need to associate
  // the remaining steps with the error object to grab the updated stack trace later.
  associateErrorWithRunningSteps(error);
};
exports.reportStepError = reportStepError;
var stopCurrentAllureApiStep = (status, statusDetails) => findAndStopStepWithSubsteps(stepDescriptor => isApiStep(stepDescriptor), status, statusDetails);
exports.stopCurrentAllureApiStep = stopCurrentAllureApiStep;
var findAndStopStepWithSubsteps = (pred, status, statusDetails) => stopSelectedSteps((0, _utils.popUntilFindIncluded)((0, _state.getStepStack)(), pred), status, statusDetails);
exports.findAndStopStepWithSubsteps = findAndStopStepWithSubsteps;
var stopAllSteps = (status, statusDetails) => stopSelectedSteps((0, _state.popAllSteps)(), status, statusDetails);
exports.stopAllSteps = stopAllSteps;
var finalizeSteps = () => {
  // This will stop all dangling steps (like log groups with missing endGroup calls or logs that haven't been
  // finished by Cypress due to an error).
  stopAllSteps();
  (0, _state.getStepsToFinalize)().forEach(finalizeOneStep);
  (0, _state.clearStepsToFinalize)();
};
exports.finalizeSteps = finalizeSteps;
var resolveStepStatus = step => step.error ? (0, _sdk.getStatusFromError)(step.error) : _allureJsCommons.Status.PASSED;
exports.resolveStepStatus = resolveStepStatus;
var finalizeOneStep = _ref => {
  var [step, finalizer] = _ref;
  var {
    id,
    error
  } = step;
  var data = {
    id
  };
  if (error) {
    // Cypress rewrites the stack trace of an error to point to the location in the test file. Until then, the stack
    // trace points inside the messy bundle, which is not helpful. There are circumstances when we can't be sure this
    // has happened when a step is about to stop. That's why we defer setting the status details until we are sure
    // Cypress does its job.
    data.statusDetails = (0, _sdk.getMessageAndTraceFromError)(error);
  }
  finalizer === null || finalizer === void 0 || finalizer(data);
  (0, _state.enqueueRuntimeMessage)({
    type: "cypress_step_finalize",
    data
  });
};
var stopAllureApiStepStackTip = (status, statusDetails) => {
  var stepStack = (0, _state.getStepStack)();
  var firstApiStepAfterLastLogStep = stepStack.at(stepStack.findLastIndex(isLogStep) + 1);
  if (firstApiStepAfterLastLogStep) {
    findAndStopStepWithSubsteps(logEntryOrMessage => Object.is(logEntryOrMessage, firstApiStepAfterLastLogStep), status, statusDetails);
  }
};
var propagateErrorToStepDescriptor = (step, errorOfSubstep) => {
  if (isLogStep(step)) {
    var error = step.log.attributes.error;
    if (error) {
      return step.error = error;
    }
  }
  if (errorOfSubstep) {
    step.error = errorOfSubstep;
  }
  return step.error;
};
var stopSelectedSteps = (steps, status, statusDetails) => {
  var error;
  for (var stepEntry of steps) {
    error = propagateErrorToStepDescriptor(stepEntry, error);
    stopStep(stepEntry, status, statusDetails);
  }
  if (error) {
    associateErrorWithRunningSteps(error);
  }
};
var associateErrorWithRunningSteps = error => (0, _state.getStepStack)().forEach(step => step.error = error);
var stopStep = (step, status, statusDetails) => {
  (0, _lifecycle.reportStepStop)(step, status, statusDetails);
  if (isApiStep(step) && step.error) {
    (0, _state.setupStepFinalization)(step);
  }
};
//# sourceMappingURL=steps.js.map