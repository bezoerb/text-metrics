/* eslint-env node, browser */
/**
 * Created by ben on 06.04.16.
 */
require('babel-register'); // eslint-disable-line import/no-unassigned-import
const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');

const {JSDOM} = jsdom;
const css = fs.readFileSync(path.join(__dirname, '../fixtures/bootstrap.css'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../fixtures/test.html'), 'utf8');
const dom = new JSDOM(html);

global.window = dom.window;
global.document = dom.window.document;

// Append css
const head = global.document.getElementsByTagName('head')[0];
const style = global.document.createElement('style');
style.type = 'text/css';
style.innerHTML = css;
head.appendChild(style);
