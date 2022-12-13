const fs = require('fs');
const path = require('path');
const {TestEnvironment} = require('jest-environment-jsdom');

const css = fs.readFileSync(path.join(__dirname, '../fixtures/bootstrap.css'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../fixtures/index.html'), 'utf8');

module.exports = class CustomEnvironment extends TestEnvironment {
  constructor(config, options) {
    const {projectConfig = {}} = config;
    const {testEnvironmentOptions = {}} = projectConfig;
    testEnvironmentOptions.html = html;
    super({...config, projectConfig: {...projectConfig, testEnvironmentOptions}}, options);

    const head = this.dom.window.document.querySelectorAll('head')[0];
    const style = this.dom.window.document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.append(style);

    this.global.jsdom = this.dom;
  }

  teardown() {
    this.global.jsdom = null;

    return super.teardown();
  }
};
