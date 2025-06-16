import type { CypressLogEntry } from "../types.js";
export declare const shouldCreateStepFromCommandLogEntry: (entry: CypressLogEntry) => boolean;
/**
 * Checks if the current step represents a cy.screenshot command log entry. If this is the case, associates the name
 * of the screenshot with the step. Later, that will allow converting the step with the attachment into the attachment
 * step.
 */
export declare const setupScreenshotAttachmentStep: (originalName: string | undefined, name: string) => void;
export declare const startCommandLogStep: (entry: CypressLogEntry) => void;
export declare const stopCommandLogStep: (entryId: string) => void;
