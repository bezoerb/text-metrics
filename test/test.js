/* eslint-env es6, browser */
// eslint-disable-next-line import/no-unassigned-import
import '../node_modules/babel-core/register';
import test from 'ava';
import textMetrics from '../src/index';

test('Compute with without element', t => {
    const val = textMetrics({
        'font-size': '30px',
        'font-weight': '400',
        'font-family': 'Helvetica, Arial, sans-serif'
    }).width('test');

    t.is(Math.floor(val), 48);
});

test('Compute width for h1', t => {
    const el = document.querySelector('h1');
    const val = textMetrics(el).width('TEST');
    t.is(Math.floor(val), 92);
});

test('Compute width for h2', t => {
    const el = document.querySelector('h2');
    const val = textMetrics(el).width('TEST');
    t.is(Math.floor(val), 48);
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
    let el = document.querySelector('#height');

    const text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam atque cum dolor explicabo incidunt.';
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

test('Computes height', t => {
    const text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam atque cum dolor explicabo incidunt.';

    const val = textMetrics({
        'font-size': '14px',
        'line-height': '20px',
        'font-family': 'Helvetica, Arial, sans-serif',
        'font-weight': '400',
        width: 100
    }).height(text);

    t.is(val, 160);
});
