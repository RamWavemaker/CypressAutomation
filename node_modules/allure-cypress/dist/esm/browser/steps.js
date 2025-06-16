import { Status } from "allure-js-commons";
import { getMessageAndTraceFromError, getStatusFromError } from "allure-js-commons/sdk";
import { popUntilFindIncluded } from "../utils.js";
import { reportStepStart, reportStepStop } from "./lifecycle.js";
import { clearStepsToFinalize, enqueueRuntimeMessage, getStepStack, getStepsToFinalize, popAllSteps, pushStep, setupStepFinalization } from "./state.js";
import { generateApiStepId } from "./utils.js";
export var ALLURE_STEP_CMD_SUBJECT = {};
export var isApiStep = descriptor => {
  return descriptor.type === "api";
};
export var isLogStep = descriptor => {
  return descriptor.type === "log";
};
export var startAllureApiStep = name => reportStepStart(pushAllureStep(), name);
export var pushAllureStep = () => {
  var id = generateApiStepId();
  pushStep({
    id,
    type: "api"
  });
  return id;
};
export var reportStepError = error => {
  var status = getStatusFromError(error);
  var statusDetails = getMessageAndTraceFromError(error);

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
export var stopCurrentAllureApiStep = (status, statusDetails) => findAndStopStepWithSubsteps(stepDescriptor => isApiStep(stepDescriptor), status, statusDetails);
export var findAndStopStepWithSubsteps = (pred, status, statusDetails) => stopSelectedSteps(popUntilFindIncluded(getStepStack(), pred), status, statusDetails);
export var stopAllSteps = (status, statusDetails) => stopSelectedSteps(popAllSteps(), status, statusDetails);
export var finalizeSteps = () => {
  // This will stop all dangling steps (like log groups with missing endGroup calls or logs that haven't been
  // finished by Cypress due to an error).
  stopAllSteps();
  getStepsToFinalize().forEach(finalizeOneStep);
  clearStepsToFinalize();
};
export var resolveStepStatus = step => step.error ? getStatusFromError(step.error) : Status.PASSED;
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
    data.statusDetails = getMessageAndTraceFromError(error);
  }
  finalizer === null || finalizer === void 0 || finalizer(data);
  enqueueRuntimeMessage({
    type: "cypress_step_finalize",
    data
  });
};
var stopAllureApiStepStackTip = (status, statusDetails) => {
  var stepStack = getStepStack();
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
var associateErrorWithRunningSteps = error => getStepStack().forEach(step => step.error = error);
var stopStep = (step, status, statusDetails) => {
  reportStepStop(step, status, statusDetails);
  if (isApiStep(step) && step.error) {
    setupStepFinalization(step);
  }
};
//# sourceMappingURL=steps.js.map