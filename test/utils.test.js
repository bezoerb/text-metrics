/* eslint-env es6, browser, jest */
import {utils} from '..';

const {CSSStyleDeclaration} = require('cssstyle');

describe('Utils', () => {
  test('isElement', () => {
    const el = document.querySelector('h1');
    expect(utils.isElement({})).toBeFalsy();
    expect(utils.isElement(1)).toBeFalsy();
    expect(utils.isElement(false)).toBeFalsy();
    expect(utils.isElement(null)).toBeFalsy();
    expect(utils.isElement(undefined)).toBeFalsy();
    expect(utils.isElement(el)).toBeTruthy();
  });

  test('isObject', () => {
    expect(utils.isObject({})).toBeTruthy();
    expect(utils.isObject(1)).toBeFalsy();
    expect(utils.isObject(false)).toBeFalsy();
    expect(utils.isObject(null)).toBeFalsy();
    expect(utils.isObject(undefined)).toBeFalsy();
    expect(utils.isObject([])).toBeFalsy();
  });

  test('isCSSStyleDeclaration', () => {
    const style = new CSSStyleDeclaration();

    expect(utils.isCSSStyleDeclaration(style)).toBeTruthy();
    expect(utils.isCSSStyleDeclaration({})).toBeFalsy();
  });

  test('getStyle', () => {
    const el = document.querySelector('h1');
    const style = utils.getStyle(el);

    expect(typeof style.getPropertyValue === 'function').toBeTruthy();
    expect(utils.isCSSStyleDeclaration(style)).toBeTruthy();
  });

  test('getFont', () => {
    const style = new CSSStyleDeclaration();
    style.setProperty('font-family', 'Helvetica, Arial');
    style.setProperty('font-size', '1em');
    style.setProperty('font-style', 'italic');
    style.setProperty('font-weight', 'bolder');

    expect(utils.getFont(style)).toBe('bolder italic 16px Helvetica, Arial');

    const el = document.querySelector('h1');
    expect(utils.getFont(utils.getStyle(el))).toBe('500 36px Helvetica, Arial, sans-serif');
  });

  test('canGetComputedStyle', () => {
    const el = document.querySelector('h1');

    expect(utils.canGetComputedStyle(el)).toBeTruthy();
    expect(utils.canGetComputedStyle({})).toBeFalsy();
  });

  test('getStyledText', () => {
    const el = document.querySelector('h1');
    const style = utils.getStyle(el);
    const text = 'This is a test string';

    expect(utils.getStyledText(text, style)).toBe('THIS IS A TEST STRING');
  });

  test('prop', () => {
    const obj = {a: 42, b: '42'};

    expect(utils.prop(obj, 'a', 0)).toBe(42);
    expect(utils.prop(obj, 'b')).toBe('42');
    // Expect(utils.prop(obj, 'c', 1)).toBe(1);
    // t.not(utils.prop(obj, 'c'), 1);
  });

  test('normalizeOptions', () => {
    const obj = {a: 1, 'font-size': '1px', lineHeight: 1};
    const normalized = utils.normalizeOptions(obj);

    expect(normalized.a).toBe(1);
    expect(normalized['font-size']).toBe('1px');
    expect(normalized['line-height']).toBe(1);
    expect(normalized.lineHeight).toBeFalsy();
  });
});
