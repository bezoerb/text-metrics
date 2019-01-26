/* eslint-env es6, browser, jest */
import {init, utils} from '..';

const {getContext2d} = utils;

describe('index', () => {
  beforeAll(async () => {});

  test('Compute with without element', () => {
    const expected = getContext2d('400 30px Helvetica, Arial, sans-serif').measureText('test');

    const val = init({
      'font-size': '30px',
      'font-weight': '400',
      'font-family': 'Helvetica, Arial, sans-serif',
    }).width('test');

    expect(val).toBe(expected.width);
  });

  test('Dooes not break without element', () => {
    const val = init();

    expect(val.lines()).toMatchObject([]);
    expect(val.maxFontSize()).toBe(undefined);
    expect(val.width()).toBe(0);
    expect(val.height()).toBe(0);
  });

  test('Compute width for h1', () => {
    const expected = getContext2d('500 36px Helvetica, Arial, sans-serif').measureText('TEST');

    const el = document.querySelector('h1');
    const val = init(el).width('TEST');
    expect(val).toBe(expected.width);
  });

  test('Compute width for h2', () => {
    // Lowercase as this get's applied via css
    const expected = getContext2d('500 30px Helvetica, Arial, sans-serif').measureText('test');

    const el = document.querySelector('h2');
    const val = init(el).width('TEST');
    expect(val).toBe(expected.width);
  });

  test('Computes width', () => {
    const el = document.querySelector('h1');
    const metrics = init(el);
    const v1 = metrics.width('-');
    const v2 = metrics.width('--');
    const v3 = metrics.width('---');

    expect(v1 < v2 < v3).toBeTruthy();
  });

  test('Computes maxFontSize', () => {
    const el = document.querySelector('#max-font-size');
    const val = init(el).maxFontSize('unicorn');
    expect(val).toBe('182px');
  });

  test('Computes lines', () => {
    const el = document.querySelector('#height');

    const text =
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam atque cum dolor explicabo incidunt.';
    const expected = [
      'Lorem ipsum',
      'dolor sit amet,',
      'consectetur',
      'adipisicing elit.',
      'Aliquam atque',
      'cum dolor',
      'explicabo',
      'incidunt.',
    ];

    const value = init(el).lines(text);

    expect(value.length).toBe(expected.length);

    for (let i = 0; i < value.length; i++) {
      expect(value[i]).toBe(expected[i]);
    }
  });

  test('Computes lines with breaks', () => {
    const el = document.querySelector('#lines');
    const text =
      'Lo&shy;rem ipsum d&shy;o&shy;lor sit amet, c&shy;onsectur a&shy;dipisicing elit. Aliquam atque cum dolor explicabo &bigstar;.';
    const expected = [
      'Lorem',
      'ipsum dolor',
      'sit amet, c-',
      'onsectur a-',
      'dipisicing',
      'elit. Aliquam',
      'atque cum',
      'dolor',
      'explicabo',
      '&bigstar;.',
    ];

    const value = init(el).lines(text);

    expect(value.length).toBe(expected.length);

    for (let i = 0; i < value.length; i++) {
      expect(value[i]).toBe(expected[i]);
    }
  });

  test('Computes lines with break-all', () => {
    const el = document.querySelector('#lines-break');
    // Need to pass text as the jsdom implementation of innerText differs from browsers
    // https://github.com/tmpvar/jsdom/issues/1245
    const text =
      'Lorem ipsum d&shy;o&shy;lor sit amet, c&mdash;onsectur a&mdash;dipisicing elit. Ali<br/>quam atque cum dolor explicabo incidunt.';
    const expected = [
      'Lorem ipsum d-',
      'olor sit amet, c',
      '—onsectur a—',
      'dipisicing elit. Al',
      'i',
      'quam atque cu',
      'm dolor explica',
      'bo incidunt.',
    ];

    const value = init(el).lines(text);
    expect(value.length).toBe(expected.length);

    for (let i = 0; i < value.length; i++) {
      expect(value[i]).toBe(expected[i]);
    }
  });

  test('Computes height', () => {
    const text =
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam atque cum dolor explicabo incidunt.';

    const val = init({
      'font-size': '14px',
      'line-height': '20px',
      'font-family': 'Helvetica, Arial, sans-serif',
      'font-weight': '400',
      width: 100,
    }).height(text);

    expect(val).toBe(160);
  });

  test('Consider letter- and word-spacing', () => {
    const referenceline = 'sit amet, consectetur';
    const reference = getContext2d('500 24px Helvetica, Arial, sans-serif').measureText(referenceline);
    // Width + word-spacing (10px) + letter-spacing (2px)
    const referenceWidth = reference.width + 20 + referenceline.length * 2;
    const el = document.querySelector('h3');
    const metrics = init(el, {'line-height': '26px'});

    const lines = metrics.lines();
    const width = metrics.width(null, {multiline: true});
    const height = metrics.height();

    const expected = [
      'Lorem ipsum dolor',
      'sit amet, consectetur',
      'adipisicing elit.',
      'Aliquam atque cum',
      'dolor explicabo',
      'incidunt.',
    ];

    expect(lines.length).toBe(expected.length);

    for (let i = 0; i < lines.length; i++) {
      expect(lines[i]).toBe(expected[i]);
    }

    expect(width).toBe(referenceWidth);
    expect(height).toBe(26 * expected.length);
  });

  test('Consider multiple line breaking characters', () => {
    const text =
      'Von Kabeljau über Lachs und Thunfisch bis hin zu Zander – unsere Fisch-Vielfalt wird Sie begeistern. Bestimmt!';
    const lines = init({
      'font-size': '14px',
      'line-height': '20px',
      'font-family': 'Helvetica, Arial, sans-serif',
      'font-weight': '400',
      width: 400,
    }).lines(text);

    const expected = [
      'Von Kabeljau über Lachs und Thunfisch bis hin zu Zander –',
      'unsere Fisch-Vielfalt wird Sie begeistern. Bestimmt!',
    ];

    expect(lines.length).toBe(expected.length);
    for (let i = 0; i < lines.length; i++) {
      expect(lines[i]).toBe(expected[i]);
    }
  });

  test.skip('Computes lines with one very long word', () => {
    const el = document.querySelector('#height');
    const text =
      'Craspharetrapharetragravida.Vivamusconsequatlacusvelposuerecongue.Duisaloremvitaeexauctorscelerisquenoneuturpis.Utimperdietmagnasitametjustobibendumvehicula.';
    const expected = [
      'Craspharetraph',
      'aretragravida.Vi',
      'vamusconsequ',
      'atlacusvelposu',
      'erecongue.Duis',
      'aloremvitaeexa',
      'uctorscelerisqu',
      'enoneuturpis.Ut',
      'imperdietmagn',
      'asitametjustobi',
      'bendumvehicul',
      'a.',
    ];

    const value = init(el).lines(text, {}, {'word-break': 'break-all'});

    expect(value.length).toBe(expected.length);

    for (let i = 0; i < value.length; i++) {
      expect(value[i]).toBe(expected[i]);
    }
  });
});
