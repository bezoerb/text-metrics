/**
 * Custom JSDOM Environment to support canvas 2.x
 * Also prepares html / css for testing
 */

const fs = require('fs');
const path = require('path');
const {installCommonGlobals} = require('jest-util');
const {LegacyFakeTimers, ModernFakeTimers} = require('@jest/fake-timers');
const {ModuleMocker} = require('jest-mock');
// const mock = require('jest-mock');
const {JSDOM, VirtualConsole} = require('jsdom');

const css = fs.readFileSync(path.join(__dirname, '../fixtures/bootstrap.css'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../fixtures/index.html'), 'utf8');

class JSDOMEnvironment {
  constructor(config, options = {}) {
    this.dom = new JSDOM(html, {
      pretendToBeVisual: true,
      runScripts: 'dangerously',
      url: config.testURL,
      virtualConsole: new VirtualConsole().sendTo(options.console || console),
      ...config.testEnvironmentOptions,
    });

    this.vmContext = this.dom.getInternalVMContext();

    this.global = this.dom.window.document.defaultView;
    const {global} = this;

    // Node's error-message stack size is limited at 10, but it's pretty useful
    // to see more than that when a test fails.
    // this.global.Error.stackTraceLimit = 100;
    installCommonGlobals(global, config.globals);

    // Append css
    const head = global.document.querySelectorAll('head')[0];
    const style = global.document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.append(style);

    // Report uncaught errors.
    this.errorEventListener = (event) => {
      if (userErrorListenerCount === 0 && event.error) {
        process.emit('uncaughtException', event.error);
      }
    };

    global.addEventListener('error', this.errorEventListener);

    // However, don't report them as uncaught if the user listens to 'error' event.
    // In that case, we assume the might have custom error handling logic.
    const originalAddListener = global.addEventListener;
    const originalRemoveListener = global.removeEventListener;
    let userErrorListenerCount = 0;
    global.addEventListener = function (...args) {
      const [name] = args;
      if (name === 'error') {
        userErrorListenerCount++;
      }

      return originalAddListener.apply(this, args);
    };

    global.removeEventListener = function (...args) {
      const [name] = args;
      if (name === 'error') {
        userErrorListenerCount--;
      }

      return originalRemoveListener.apply(this, args);
    };

    this.moduleMocker = new ModuleMocker(global);

    const timerConfig = {
      idToRef: (id) => id,
      refToId: (ref) => ref,
    };

    this.fakeTimers = new LegacyFakeTimers({
      config,
      global,
      moduleMocker: this.moduleMocker,
      timerConfig,
    });

    this.fakeTimersModern = new ModernFakeTimers({config, global});
  }

  setup() {
    return Promise.resolve();
  }

  teardown() {
    if (this.fakeTimers) {
      this.fakeTimers.dispose();
    }

    if (this.fakeTimersModern) {
      this.fakeTimersModern.dispose();
    }

    if (this.global) {
      if (this.errorEventListener) {
        this.global.removeEventListener('error', this.errorEventListener);
      }

      // Dispose "document" to prevent "load" event from triggering.
      Object.defineProperty(this.global, 'document', {value: null});
      this.global.close();
    }

    this.errorEventListener = null;
    this.global = null;
    this.dom = null;
    this.fakeTimers = null;
    return Promise.resolve();
  }

  runScript(script) {
    if (this.vmContext) {
      return script.runInContext(this.vmContext);
    }

    return null;
  }
}

module.exports = JSDOMEnvironment;
