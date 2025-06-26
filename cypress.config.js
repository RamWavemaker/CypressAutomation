const { defineConfig } = require("cypress");
require('dotenv').config();
const awsController = require('./cypress/utils/AwsController');
const allureCypress = require("allure-cypress/reporter").allureCypress;
const os = require("node:os");
const fs = require("fs-extra");
const path = require("path");

module.exports = defineConfig({
  projectId: 'sorrycypress123',
  screenshotOnRunFailure: true,
  e2e: {
    defaultCommandTimeout: 20000, 
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {

      allureCypress(on, config, {
        resultsDir: process.env.ALLURE_RESULTS_DIR || "allure-results",
      });

      on('before:run', () => {

        const resultsDir = process.env.ALLURE_RESULTS_DIR || "allure-results";
        const allureResultsDir = path.join(__dirname, resultsDir);
        const allureReportDir = path.join(__dirname, 'allure-report');

        console.log("🧹 Cleaning old Allure report folders...");

        [allureResultsDir, allureReportDir].forEach(dir => {
          if (fs.existsSync(dir)) {
            fs.removeSync(dir); // deletes folder and contents
            console.log(`🗑️  Deleted ${dir}`);
          }
        });
      });

      on('task', {
        async downloadFileFromS3({ key, downloadPath }) {
          const bucketName = process.env.S3_BUCKET_NAME;
          return await awsController.downloadFromS3({ bucketName, key, downloadPath });
        },

        fileExists(filePath) {
          const fs = require('fs');
          return fs.existsSync(filePath);
        }
      });

      return config;
    },
  },
});
