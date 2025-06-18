import { enableAllure, enableReportingOfCypressScreenshots } from "./events/index.js";
import { isAllureInitialized, setAllureInitialized } from "./state.js";
export var initializeAllure = () => {
  if (isAllureInitialized()) {
    return;
  }
  setAllureInitialized();
  enableAllure();
  enableReportingOfCypressScreenshots();
};
//# sourceMappingURL=index.js.map