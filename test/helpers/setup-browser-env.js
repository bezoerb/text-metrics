/* eslint-env node, browser */
/**
 * Created by ben on 06.04.16.
 */
const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.join(__dirname, '../fixtures/bootstrap.css'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../fixtures/test.html'), 'utf8');

global.document = require('jsdom').jsdom(html);

global.window = document.defaultView;

// append css
const head = global.document.getElementsByTagName('head')[0];
const style = global.document.createElement('style');
style.type = 'text/css';
style.innerHTML = css;
head.appendChild(style);
