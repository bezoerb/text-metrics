/* eslint-env es6, browser */
// eslint-disable-next-line import/no-unassigned-import
import '../node_modules/babel-core/register';
import test from 'ava';
import {getContext2d} from '../src/utils';
import textMetrics from '../src';

test('Compute with without element', t => {
    const expected = getContext2d(
        '400 30px Helvetica, Arial, sans-serif'
    ).measureText('test');

    const val = textMetrics({
        'font-size': '30px',
        'font-weight': '400',
        'font-family': 'Helvetica, Arial, sans-serif'
    }).width('test');
    t.is(val, expected.width);
});

test('Compute width for h1', t => {
    const expected = getContext2d(
        '500 36px Helvetica, Arial, sans-serif'
    ).measureText('TEST');

    const el = document.querySelector('h1');
    const val = textMetrics(el).width('TEST');
    t.is(val, expected.width);
});

test('Compute width for h2', t => {
    // Lowercase as this get's applied via css
    const expected = getContext2d(
        '500 30px Helvetica, Arial, sans-serif'
    ).measureText('test');

    const el = document.querySelector('h2');
    const val = textMetrics(el).width('TEST');
    t.is(val, expected.width);
});

test('Computes width', t => {
    const el = document.querySelector('h1');
    const metrics = textMetrics(el);
    const v1 = metrics.width('-');
    const v2 = metrics.width('--');
    const v3 = metrics.width('---');

    t.true(v1 < v2 < v3);
});

test('Computes maxFontSize', t => {
    const el = document.querySelector('#max-font-size');
    const val = textMetrics(el).maxFontSize('unicorn');
    t.is(val, '183px');
});

test('Computes lines', t => {
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
        'incidunt.'
    ];

    const value = textMetrics(el).lines(text);

    t.is(value.length, expected.length);

    for (let i = 0; i < value.length; i++) {
        t.is(value[i], expected[i]);
    }
});

test('Computes lines with breaks', t => {
    const el = document.querySelector('#lines');
    const text =
        'Lo&shy;rem ipsum d&shy;o&shy;lor sit amet, c&mdash;onsectur a&mdash;dipisicing elit. Aliquam atque cum dolor explicabo &bigstar;.';
    const expected = [
        'Lorem ipsum d-',
        'olor sit amet, c',
        '—onsectur a—',
        'dipisicing elit.',
        'Aliquam atque',
        'cum dolor',
        'explicabo',
        '&bigstar;.'
    ];

    const value = textMetrics(el).lines(text);

    t.is(value.length, expected.length);

    for (let i = 0; i < value.length; i++) {
        t.is(value[i], expected[i]);
    }
});

test('Computes lines with break-all', t => {
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
        'bo incidunt.'
    ];

    const value = textMetrics(el).lines(text);
    t.is(value.length, expected.length);

    for (let i = 0; i < value.length; i++) {
        t.is(value[i], expected[i]);
    }
});

test('Computes height', t => {
    const text =
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam atque cum dolor explicabo incidunt.';

    const val = textMetrics({
        'font-size': '14px',
        'line-height': '20px',
        'font-family': 'Helvetica, Arial, sans-serif',
        'font-weight': '400',
        width: 100
    }).height(text);

    t.is(val, 160);
});

test('Consider letter- and word-spacing', t => {
    const referenceline = 'sit amet, consectetur';
    const reference = getContext2d(
        '500 24px Helvetica, Arial, sans-serif'
    ).measureText(referenceline);
    // Width + word-spacing (10px) + letter-spacing (2px)
    // eslint-disable-next-line  no-mixed-operators
    const referenceWidth = reference.width + 20 + referenceline.length * 2;

    const el = document.querySelector('h3');
    const metrics = textMetrics(el, {'line-height': '26px'});

    const lines = metrics.lines();
    const width = metrics.width(null, {multiline: true});
    const height = metrics.height();

    const expected = [
        'Lorem ipsum dolor',
        'sit amet, consectetur',
        'adipisicing elit.',
        'Aliquam atque cum',
        'dolor explicabo',
        'incidunt.'
    ];

    t.is(lines.length, expected.length);

    for (let i = 0; i < lines.length; i++) {
        t.is(lines[i], expected[i]);
    }

    t.is(width, referenceWidth);
    t.is(height, 26 * expected.length);
});

test('Consider multiple line breaking characters', t => {
    const text =
        'Von Kabeljau über Lachs und Thunfisch bis hin zu Zander – unsere Fisch-Vielfalt wird Sie begeistern. Bestimmt!';
    const lines = textMetrics({
        'font-size': '14px',
        'line-height': '20px',
        'font-family': 'Helvetica, Arial, sans-serif',
        'font-weight': '400',
        width: 400
    }).lines(text);

    const expected = [
        'Von Kabeljau über Lachs und Thunfisch bis hin zu Zander –',
        'unsere Fisch-Vielfalt wird Sie begeistern. Bestimmt!'
    ];

    t.is(lines.length, expected.length);
    for (let i = 0; i < lines.length; i++) {
        t.is(lines[i], expected[i]);
    }
});

test('Computes lines with one very long word', t => {
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
        'a.'
    ];

    const value = textMetrics(el).lines(text, {}, {'word-break': 'break-all'});

    t.is(value.length, expected.length);

    for (let i = 0; i < value.length; i++) {
        t.is(value[i], expected[i]);
    }
});
