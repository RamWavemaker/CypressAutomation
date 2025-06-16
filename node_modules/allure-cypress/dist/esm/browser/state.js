import { DEFAULT_RUNTIME_CONFIG, last, toReversed } from "../utils.js";
export var getAllureState = () => {
  var state = Cypress.env("allure");
  if (!state) {
    state = {
      config: DEFAULT_RUNTIME_CONFIG,
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
export var isAllureInitialized = () => getAllureState().initialized;
export var setAllureInitialized = () => {
  getAllureState().initialized = true;
};
export var getRuntimeMessages = () => getAllureState().messages;
export var setRuntimeMessages = value => {
  getAllureState().messages = value;
};
export var enqueueRuntimeMessage = message => {
  getRuntimeMessages().push(message);
};
export var getAllureTestPlan = () => getAllureState().testPlan;
export var getProjectDir = () => getAllureState().projectDir;
export var getCurrentTest = () => getAllureState().currentTest;
export var setCurrentTest = test => {
  getAllureState().currentTest = test;
};
export var dropCurrentTest = () => {
  getAllureState().currentTest = undefined;
};
export var getConfig = () => getAllureState().config;
export var getStepStack = () => getAllureState().stepStack;
export var getCurrentStep = () => last(getStepStack());
export var pushStep = step => getStepStack().push(step);
export var popStep = () => getStepStack().pop();
export var popSteps = index => toReversed(getStepStack().splice(index));
export var popAllSteps = () => popSteps(0);
export var clearStepStack = () => {
  getAllureState().stepStack = [];
};
export var setupStepFinalization = (step, finalizer) => getAllureState().stepsToFinalize.push([step, finalizer]);
export var getStepsToFinalize = () => getAllureState().stepsToFinalize;
export var clearStepsToFinalize = () => {
  var state = getAllureState();
  state.stepsToFinalize = [];
};
//# sourceMappingURL=state.js.map