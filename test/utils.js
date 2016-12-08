/* eslint-env es6, browser */
// eslint-disable-next-line import/no-unassigned-import
import '../node_modules/babel-core/register';
import test from 'ava';
import {CSSStyleDeclaration} from 'cssstyle';
import * as utils from '../src/utils';

test('isElement', t => {
    const el = document.querySelector('h1');

    t.false(utils.isElement({}));
    t.false(utils.isElement(1));
    t.false(utils.isElement(false));
    t.false(utils.isElement(null));
    t.false(utils.isElement(undefined));
    t.true(utils.isElement(el));
});

test('isObject', t => {
    t.true(utils.isObject({}));
    t.false(utils.isObject(1));
    t.false(utils.isObject(false));
    t.false(utils.isObject(null));
    t.false(utils.isObject(undefined));
    t.false(utils.isObject([]));
});

test('isCSSStyleDeclaration', t => {
    const style = new CSSStyleDeclaration();

    t.true(utils.isCSSStyleDeclaration(style));
    t.false(utils.isCSSStyleDeclaration({}));
});

test('getStyle', t => {
    const el = document.querySelector('h1');
    const style = utils.getStyle(el);

    t.true(typeof style.getPropertyValue === 'function');
    t.true(utils.isCSSStyleDeclaration(style));
});

test('getFont', t => {
    const style = new CSSStyleDeclaration();
    style.setProperty('font-family', 'Helvetica, Arial');
    style.setProperty('font-size', '1em');
    style.setProperty('font-style', 'italic');
    style.setProperty('font-weight', 'bolder');

    t.is(utils.getFont(style), 'bolder italic 16px Helvetica, Arial');

    const el = document.querySelector('h1');
    t.is(utils.getFont(utils.getStyle(el)), '500 36px Helvetica, Arial, sans-serif');
});

test('canGetComputedStyle', t => {
    const el = document.querySelector('h1');

    t.true(utils.canGetComputedStyle(el));
    t.false(utils.canGetComputedStyle({}));
});

test('getStyledText', t => {
    const el = document.querySelector('h1');
    const style = utils.getStyle(el);
    const text = 'This is a test string';

    t.is(utils.getStyledText(text, style), 'THIS IS A TEST STRING');
});

test('prop', t => {
    const obj = {a: 42, b: '42'};

    t.is(utils.prop(obj, 'a', 0), 42);
    t.is(utils.prop(obj, 'b'), '42');
    t.is(utils.prop(obj, 'c', 1), 1);
    t.not(utils.prop(obj, 'c'), 1);
});

test('normalizeOptions', t => {
    const obj = {a: 1, 'font-size': '1px', lineHeight: 1};
    const normalized = utils.normalizeOptions(obj);

    t.is(normalized.a, 1);
    t.is(normalized['font-size'], '1px');
    t.is(normalized['line-height'], 1);
    t.falsy(normalized.lineHeight);
});
