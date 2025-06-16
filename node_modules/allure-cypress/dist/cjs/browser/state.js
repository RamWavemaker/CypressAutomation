"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setupStepFinalization = exports.setRuntimeMessages = exports.setCurrentTest = exports.setAllureInitialized = exports.pushStep = exports.popSteps = exports.popStep = exports.popAllSteps = exports.isAllureInitialized = exports.getStepsToFinalize = exports.getStepStack = exports.getRuntimeMessages = exports.getProjectDir = exports.getCurrentTest = exports.getCurrentStep = exports.getConfig = exports.getAllureTestPlan = exports.getAllureState = exports.enqueueRuntimeMessage = exports.dropCurrentTest = exports.clearStepsToFinalize = exports.clearStepStack = void 0;
var _utils = require("../utils.js");
var getAllureState = () => {
  var state = Cypress.env("allure");
  if (!state) {
    state = {
      config: _utils.DEFAULT_RUNTIME_CONFIG,
      initialized: false,
      messages: [],
      testPlan: undefined,
      currentTest: undefined,
      projectDir: undefined,
      stepStack: [],
      stepsToFinalize: [],
      nextApiStepId: 0
    };
    Cypress.env("allure", state);
  }
  return state;
};
exports.getAllureState = getAllureState;
var isAllureInitialized = () => getAllureState().initialized;
exports.isAllureInitialized = isAllureInitialized;
var setAllureInitialized = () => {
  getAllureState().initialized = true;
};
exports.setAllureInitialized = setAllureInitialized;
var getRuntimeMessages = () => getAllureState().messages;
exports.getRuntimeMessages = getRuntimeMessages;
var setRuntimeMessages = value => {
  getAllureState().messages = value;
};
exports.setRuntimeMessages = setRuntimeMessages;
var enqueueRuntimeMessage = message => {
  getRuntimeMessages().push(message);
};
exports.enqueueRuntimeMessage = enqueueRuntimeMessage;
var getAllureTestPlan = () => getAllureState().testPlan;
exports.getAllureTestPlan = getAllureTestPlan;
var getProjectDir = () => getAllureState().projectDir;
exports.getProjectDir = getProjectDir;
var getCurrentTest = () => getAllureState().currentTest;
exports.getCurrentTest = getCurrentTest;
var setCurrentTest = test => {
  getAllureState().currentTest = test;
};
exports.setCurrentTest = setCurrentTest;
var dropCurrentTest = () => {
  getAllureState().currentTest = undefined;
};
exports.dropCurrentTest = dropCurrentTest;
var getConfig = () => getAllureState().config;
exports.getConfig = getConfig;
var getStepStack = () => getAllureState().stepStack;
exports.getStepStack = getStepStack;
var getCurrentStep = () => (0, _utils.last)(getStepStack());
exports.getCurrentStep = getCurrentStep;
var pushStep = step => getStepStack().push(step);
exports.pushStep = pushStep;
var popStep = () => getStepStack().pop();
exports.popStep = popStep;
var popSteps = index => (0, _utils.toReversed)(getStepStack().splice(index));
exports.popSteps = popSteps;
var popAllSteps = () => popSteps(0);
exports.popAllSteps = popAllSteps;
var clearStepStack = () => {
  getAllureState().stepStack = [];
};
exports.clearStepStack = clearStepStack;
var setupStepFinalization = (step, finalizer) => getAllureState().stepsToFinalize.push([step, finalizer]);
exports.setupStepFinalization = setupStepFinalization;
var getStepsToFinalize = () => getAllureState().stepsToFinalize;
exports.getStepsToFinalize = getStepsToFinalize;
var clearStepsToFinalize = () => {
  var state = getAllureState();
  state.stepsToFinalize = [];
};
exports.clearStepsToFinalize = clearStepsToFinalize;
//# sourceMappingURL=state.js.map