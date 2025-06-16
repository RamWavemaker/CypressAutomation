import type { AllureSpecState, CypressMessage, CypressTest, StepDescriptor, StepFinalizer } from "../types.js";
export declare const getAllureState: () => AllureSpecState;
export declare const isAllureInitialized: () => boolean;
export declare const setAllureInitialized: () => void;
export declare const getRuntimeMessages: () => CypressMessage[];
export declare const setRuntimeMessages: (value: CypressMessage[]) => void;
export declare const enqueueRuntimeMessage: (message: CypressMessage) => void;
export declare const getAllureTestPlan: () => import("allure-js-commons/sdk").TestPlanV1 | null | undefined;
export declare const getProjectDir: () => string | undefined;
export declare const getCurrentTest: () => CypressTest | undefined;
export declare const setCurrentTest: (test: CypressTest) => void;
export declare const dropCurrentTest: () => void;
export declare const getConfig: () => {
    stepsFromCommands: {
        maxArgumentLength: number;
        maxArgumentDepth: number;
    };
};
export declare const getStepStack: () => StepDescriptor[];
export declare const getCurrentStep: () => StepDescriptor | undefined;
export declare const pushStep: (step: StepDescriptor) => number;
export declare const popStep: () => StepDescriptor | undefined;
export declare const popSteps: (index: number) => StepDescriptor[];
export declare const popAllSteps: () => StepDescriptor[];
export declare const clearStepStack: () => void;
export declare const setupStepFinalization: <T extends StepDescriptor>(step: T, finalizer?: StepFinalizer) => number;
export declare const getStepsToFinalize: () => [step: StepDescriptor, finalizer: StepFinalizer | undefined][];
export declare const clearStepsToFinalize: () => void;
