import {readFileSync} from 'node:fs';
import path, {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {TestEnvironment} from 'jest-environment-jsdom';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const css = readFileSync(join(__dirname, '../fixtures/bootstrap.css'), 'utf8');
const html = readFileSync(join(__dirname, '../fixtures/index.html'), 'utf8');

export default class CustomEnvironment extends TestEnvironment {
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
}
