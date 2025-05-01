const { defineConfig } = require("cypress");
const { allureCypress } = require("allure-cypress/reporter");
const { Status } = require("allure-js-commons");
require('dotenv').config();
const awsController = require('./cypress/utils/AwsController');

const os = require("node:os");
const fs = require("fs-extra");
const path = require("path");

module.exports = defineConfig({
  projectId: 'pm93iy',
  video: true,
  videoUploadOnPasses: true,
  screenshotOnRunFailure: true,
  e2e: {
    defaultCommandTimeout: 10000,
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      on('task', {
        async downloadFileFromS3({ key, downloadPath }) {
          const bucketName = process.env.S3_BUCKET_NAME;
          return await awsController.downloadFromS3({ bucketName, key, downloadPath });
        },

        fileExists(filePath) {
          const fs = require('fs');
          return fs.existsSync(filePath);
        },


        dragndropWidget(){
          cy.window().then((win) => {
            (function( $ ) {
              $.fn.simulateDragDrop = function(options) {
                  return this.each(function() {
                      new $.simulateDragDrop(this, options);
                  });
              };
              $.simulateDragDrop = function(elem, options) {
                  this.options = options;
                  this.simulateEvent(elem, options);
              };
              $.extend($.simulateDragDrop.prototype, {
                  simulateEvent: function(elem, options) {
                      /Simulating drag start/
                      var type = 'dragstart';
                      var event = this.createEvent(type);
                      this.dispatchEvent(elem, type, event);
          
                      /Simulating dragover/
                      type = 'dragover';
                      var dragOverEvent = this.createEvent(type, {});
                      dragOverEvent.dataTransfer = event.dataTransfer;
                      dragOverEvent.dataTransfer.setData('text','__dnd__simulation__');
                      this.dispatchEvent($(options.dropTarget)[0], type, dragOverEvent);
          
                      /Simulating drop/
                      type = 'drop';
                      var dropEvent = this.createEvent(type, {});
                      dropEvent.dataTransfer = event.dataTransfer;
                      this.dispatchEvent($(options.dropTarget)[0], type, dropEvent);
          
                      /Simulating drag end/
          
                      type = 'dragend';
                      var dragEndEvent = this.createEvent(type, {});
                      dragEndEvent.dataTransfer = event.dataTransfer;
                      this.dispatchEvent(elem, type, dragEndEvent);
                  },
                  createEvent: function(type) {
                      var event = document.createEvent("CustomEvent");
                      event.initCustomEvent(type, true, true, null);
                      event.dataTransfer = {
                          data: {
                          },
                          setData: function(type, val){
                              this.data[type] = val;
                          },
                          getData: function(type){
                              return this.data[type];
                          }
                      };
                      return event;
                  },
                  dispatchEvent: function(elem, type, event) {
                      if(elem.dispatchEvent) {
                          elem.dispatchEvent(event);
                      }else if( elem.fireEvent ) {
                          elem.fireEvent("on"+type, event);
                      }
                  }
              });
          })(jQuery); $('li[name="wm-widget-button"]').simulateDragDrop({dropTarget: $('.app-page-content')})
          });
        }
        
      });

      on('before:run', () => {
        const resultsPath = path.join(__dirname, 'allure-results');
        if (fs.existsSync(resultsPath)) {
          fs.emptyDirSync(resultsPath);
          console.log('🧹 Cleared old Allure results');
        }
      });

      allureCypress(on, config, {
        resultsDir: "allure-results",
        links: {
          issue: {
            nameTemplate: "Issue #%s",
            urlTemplate: "https://issues.example.com/%s",
          },
          tms: {
            nameTemplate: "TMS #%s",
            urlTemplate: "https://tms.example.com/%s",
          },
          jira: {
            urlTemplate: (v) => `https://jira.example.com/browse/${v}`,
          },
        },
        categories: [
          {
            name: "foo",
            messageRegex: "bar",
            traceRegex: "baz",
            matchedStatuses: [Status.FAILED, Status.BROKEN],
          },
        ],
        environmentInfo: {
          os_platform: os.platform(),
          os_release: os.release(),
          os_version: os.version(),
          node_version: process.version,
        },
      });

      return config;
    },
  },
});
