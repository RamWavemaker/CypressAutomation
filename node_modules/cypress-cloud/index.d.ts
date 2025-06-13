type TestState = "failed" | "passed" | "pending" | "skipped";
type TestAttemptState = "failed" | "passed" | "pending";
type TestingType$1 = "e2e" | "component";
interface MochaError {
    message: string;
    name: string;
    stack: string;
    parsedStack: MochaParsedStackItem[];
    codeFrame: MochaCodeFrame;
}
interface MochaInvocationDetails {
    function: string;
    fileUrl: string;
    originalFile: string;
    relativeFile: string;
    absoluteFile: string;
    line: number;
    column: number;
    whitespace: string;
    stack: string;
}
interface MochaCodeFrame {
    line: number;
    column: number;
    originalFile: string;
    relativeFile: string;
    absoluteFile: string;
    frame: string;
    language: string;
}
interface MochaParsedStackItem {
    message: string;
    whitespace: string;
    function?: string;
    fileUrl?: string;
    originalFile?: string;
    relativeFile?: string;
    absoluteFile?: string;
    line?: number;
    column?: number;
}
interface MochaHook {
    title: string;
    hookName: string;
    hookId: string;
    pending: boolean;
    body: string;
    type: string;
    file: null | string;
    invocationDetails: MochaInvocationDetails;
    currentRetry: number;
    retries: number;
    _slow: number;
}
type TimingKey = "before each" | "after each" | "after all" | "before all";
type Timing = {
    [key in TimingKey]?: HookTimingItem;
} & {
    lifecycle: number;
    test: TimingItem;
};
interface HookTimingItem extends TimingItem {
    hookId: string;
}
interface TimingItem {
    fnDuration: number;
    afterFnDuration: number;
}

/**
 * Cypress 12.17.4 and lower shape
 */
declare namespace Cypress12 {
    namespace SpecAfter {
        interface Payload {
            error: string | null;
            hooks: Hooks[] | null;
            reporter?: string;
            reporterStats: ReporterStats | null;
            screenshots: Screenshot[];
            spec: Spec;
            stats: Stats;
            tests: Test[] | null;
            video: string | null;
        }
        interface Spec {
            absolute: string;
            baseName: string;
            fileExtension: string;
            fileName: string;
            name: string;
            relative: string;
            relativeToCommonRoot: string;
            specFileExtension: string;
            specType: string;
        }
        interface Screenshot {
            height: number;
            name: string | null;
            path: string;
            screenshotId: string;
            takenAt: string;
            testAttemptIndex: number;
            testId: string;
            width: number;
        }
        interface ReporterStats {
            suites: number;
            tests: number;
            passes: number;
            pending: number;
            failures: number;
            start: string;
            end: string;
            duration: number;
        }
        interface Stats {
            suites: number;
            tests: number;
            passes: number;
            pending: number;
            skipped: number;
            failures: number;
            wallClockStartedAt: string;
            wallClockEndedAt: string;
            wallClockDuration: number;
        }
        interface Test {
            attempts: TestAttempt[];
            body: string;
            displayError: string | null;
            state: TestState;
            title: string[];
            testId: string;
        }
        interface Hooks {
            hookId: string;
            hookName: "before each" | "after each" | "before all" | "after all";
            title: string[];
            body: string;
        }
        interface TestAttempt {
            error: TestError | null;
            failedFromHookId: string | null;
            state: TestAttemptState;
            timings: Timing | null;
            videoTimestamp: number;
            wallClockDuration: number;
            wallClockStartedAt: string;
        }
        interface TestError {
            message: string;
            name: string;
            stack: string;
            codeFrame: CodeFrame | null;
        }
        interface CodeFrame {
            line: number | null;
            column: number | null;
            originalFile: string | null;
            relativeFile: string | null;
            absoluteFile: string | null;
            frame: string | null;
            language: string | null;
        }
    }
    /**
     * test:after:run event
     */
    namespace TestAfter {
        /**
         * test:after:run event payload
         */
        interface Payload extends TestBefore.Payload {
            duration: number;
            err?: MochaError;
            hooks: MochaHook[];
            timings: Timing;
        }
    }
    /**
     * test:before:run event
     */
    namespace TestBefore {
        interface Payload {
            async: boolean;
            body: string;
            currentRetry: number;
            fullTitle: string;
            hooks?: MochaHook[];
            id: string;
            invocationDetails?: MochaInvocationDetails;
            order: number;
            pending: boolean;
            retries: number;
            state: string;
            sync: boolean;
            timedOut: boolean;
            timings: Pick<Timing, "lifecycle">;
            title: string;
            type: string;
            wallClockStartedAt: string;
        }
    }
    /**
     * screenshot:after event
     */
    namespace ScreenshotAfter {
        interface Payload {
            testAttemptIndex: number;
            size: number;
            takenAt: string;
            dimensions: {
                width: number;
                height: number;
            };
            multipart: boolean;
            specName: string;
            name: string | null;
            testFailure: boolean;
            path: string;
            scaled: boolean;
            duration: number;
            blackout: string[];
        }
    }
    /**
     * Module API (cypress.run())
     */
    namespace ModuleAPI {
        /**
         *  return value of cypress.run()
         */
        type Result = CompletedResult | FailureResult;
        interface FailureResult {
            status: "failed";
            failures: number;
            message: string;
        }
        interface CompletedResult {
            browserName: string;
            browserPath: string;
            browserVersion: string;
            config: Config;
            cypressVersion: string;
            endedTestsAt: string;
            osName: string;
            osVersion: string;
            runs: Run[];
            startedTestsAt: string;
            status: "finished" | "failed";
            totalDuration: number;
            totalFailed: number;
            totalPassed: number;
            totalPending: number;
            totalSkipped: number;
            totalSuites: number;
            totalTests: number;
        }
        interface Run {
            error: SpecAfter.Payload["error"];
            hooks: SpecAfter.Payload["hooks"];
            reporter?: SpecAfter.Payload["reporter"];
            reporterStats: SpecAfter.Payload["reporterStats"];
            shouldUploadVideo: boolean;
            spec: SpecAfter.Spec;
            stats: Stats;
            tests: Test[] | null;
            video: string | null;
        }
        interface Test {
            title: string[];
            state: TestState;
            body: string;
            displayError: string | null;
            attempts: TestAttempt[];
        }
        interface TestAttempt {
            state: SpecAfter.TestAttempt["state"];
            error: SpecAfter.TestAttempt["error"];
            videoTimestamp: number;
            duration: number | null;
            startedAt: string;
            screenshots: Screenshot[];
        }
        interface Screenshot {
            name: string | null;
            takenAt: string;
            path: string;
            height: number;
            width: number;
        }
        interface Stats {
            duration: number;
            endedAt: string;
            failures: number;
            passes: number;
            pending: number;
            skipped: number;
            startedAt: string;
            suites: number;
            tests: number;
        }
        interface Config {
            specPattern: string;
            video: boolean;
            videoUploadOnPasses: boolean;
            version: string;
            testingType: TestingType$1;
        }
    }
}

type TestingType = Cypress.TestingType;
declare enum DebugMode {
    None = "none",
    All = "all",
    Currents = "currents",
    Cypress = "cypress",
    CommitInfo = "commit-info"
}
type StrippedCypressModuleAPIOptions = Omit<Partial<CypressCommandLine.CypressRunOptions>, "autoCancelAfterFailures" | "tag" | "spec" | "exit" | "headed" | "record" | "headless" | "noExit" | "parallel" | "key" | "tag" | "group" | "ciBuildId" | "cloudConfigFile">;
type CurrentsRunParameters = StrippedCypressModuleAPIOptions & {
    /** The CI build ID to use for the run */
    ciBuildId?: string;
    /** The batch size defines how many spec files will be served in one orchestration "batch". If not specified, will use the projectId from currents.config.js, the default value is 1 (i.e. no batching) */
    batchSize?: number;
    /** Whether to activate record mode and connect to cloud orchestration service */
    record?: boolean;
    /** The URL of the currents server to use. If not specified, will use the one from currents.config.js */
    cloudServiceUrl?: string;
    /** The environment variables to use for the run */
    env?: object;
    /** The group id to use for the run */
    group?: string;
    /**  The record key to use */
    recordKey?: string;
    /** Whether to run the spec files in parallel */
    parallel?: boolean;
    /** The project ID to use. */
    projectId?: string;
    /** Comma-separated string or an array of spec glob pattern for the execution */
    spec?: string | string[];
    /** Comma-separated string or an array of tags */
    tag?: string | string[];
    /** "e2e" or "component", the default value is "e2e" */
    testingType?: TestingType;
    /** Automatically abort the run after the specified number of failed tests. Overrides the default project settings. If set, must be a positive integer or "false" to disable (Currents-only) */
    autoCancelAfterFailures?: number | false;
    /**
     * Whether to launch cypress in headed mode. If set, must be a boolean, defaults to false.
     */
    headed?: boolean;
    /**
     * Configuration file name or absolute path. Default value is 'currents.config.js', if specified, must be a string. The file will be resolved relative to the project root, unless it's an absolute path.
     */
    cloudConfigFile?: string;
    /**
     * Enable debug mode for cypress-cloud, this will print out logs for troubleshooting.
     */
    cloudDebug?: DebugMode | true | string | string[];
    /**
     * Whether to record coverage results. If set, must be a boolean, defaults to false.
     */
    experimentalCoverageRecording?: boolean;
};
interface CurrentsRunAPI extends CurrentsRunParameters {
}

/**
 * Run Cypress tests with a cloud service of your choice and return the results
 *
 * @augments CurrentsRunAPI
 * @returns {CypressCommandLine.CypressRunResult | CypressCommandLine.CypressFailedRunResult | undefined} The test results, or undefined if no tests were run
 */
declare function run(params?: CurrentsRunAPI): Promise<CypressCommandLine.CypressRunResult | CypressCommandLine.CypressFailedRunResult | {
    runUrl: string;
    browserName: string;
    browserPath: string;
    browserVersion: string;
    config: Cypress12.ModuleAPI.Config;
    cypressVersion: string;
    endedTestsAt: string;
    osName: string;
    osVersion: string;
    runs: Cypress12.ModuleAPI.Run[];
    startedTestsAt: string;
    status: "finished" | "failed";
    totalDuration: number;
    totalFailed: number;
    totalPassed: number;
    totalPending: number;
    totalSkipped: number;
    totalSuites: number;
    totalTests: number;
} | undefined>;

export { CurrentsRunAPI, run };
