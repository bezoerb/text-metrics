# text-metrics

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url] [![Download][dlcounter-image]][dlcounter-url] [![Coverage Status][coveralls-image]][coveralls-url]

> An lightweight & efficient text measurement set for the browser using canvas to prevent layout reflows.

## Features

- Compute width
- Compute height
- Compute linebreaks
- Compute max font-size to fit into element

## Installation

If you're using node, you can run `npm install text-metrics`.

text-metrics is also available via [Bower](https://github.com/bower/bower) (`bower install text-metrics`)

Alternatively if you just want to grab the file yourself, you can download either the current stable [production version][min] or the [development version][max] directly.

[min]: https://raw.github.com/bezoerb/text-metrics/master/dist/text-metrics.min.js
[max]: https://raw.github.com/bezoerb/text-metrics/master/dist/text-metrics.js

## Setting it up

text-metrics supports AMD (e.g. RequireJS), CommonJS (e.g. Node.js) and direct usage (e.g. loading globally with a &lt;script&gt; tag) loading methods.
You should be able to do nearly anything, and then skip to the next section anyway and have it work. Just in case though, here's some specific examples that definitely do the right thing:

### CommonsJS (e.g. Node)

text-metrics needs some browser environment to run.

```javascript
import {tm} from 'text-metrics';

const el = document.querySelector('h1');
const metrics = tm(el);

metrics.width('unicorns');
// -> 210

metrics.height('Some long text with automatic word wraparound');
// -> 180
metrics.lines('Some long text with automatic word wraparound');
// -> ['Some long text', 'with automatic', 'word', 'wraparound']
metrics.maxFontSize('Fitting Headline');
// -> 33px
```

### Webpack / Browserify

```javascript
const textMetrics = require('text-metrics');
tm(document.querySelector('.textblock')).lines();
```

### AMD (e.g. RequireJS)

```javascript
define(['text-metrics'], function(tm) {
  tm(document.querySelector('h1')).width('unicorns');
});
```

### Directly in your web page:

```html
<script src="text-metrics.min.js"></script>
<script>
  tm(document.querySelector('h1')).width('unicorns');
</script>
```

## API

Construct textmetrics object:

`tm([el, overwrites])`

You can call textMetrics with either an HTMLElement or with an object with style overwrites or with both.
e.g.

```javascript
// takes styles from h1
tm(document.querySelector('h1'));

// takes styles from h1 and overwrites font-size
tm(document.querySelector('h1'), { fontSize: '20px'});

// only use given styles
tm({
    fontSize': '14px',
    lineHeight': '20px',
    fontFamily': 'Helvetica, Arial, sans-serif',
    fontWeight': '400',
    width: 100
});
```

## Methods

`width([text, [options, [overwrites]]])`<br/>
`height([text, [options, [overwrites]]])`<br/>
`lines([text, [options, [overwrites]]])`<br/>
`maxFontSize([text, [options, [overwrites]]])`<br/>

#### text

Type: `string`
Defaults to `el.innerText` if an element is available

#### options

Type: `object`

| key       | default | description                                                        |
| --------- | ------- | ------------------------------------------------------------------ |
| multiline | `false` | The width of widest line instead of the width of the complete text |

#### overwrites

Type: `object`

Use to overwrite styles

## Performance

I've compared this module with a very naive jQuery implementation as well as
the . See https://jsperf.com/bezoerb-text-metrics
Even if `Range.getBoundingClientRect` should be considered as a performance bottleneck according to
[what-forces-layout](https://gist.github.com/paulirish/5d52fb081b3570c81e3a) by Paul Irish,
i couldn't detect any sort of recalculate style and it massively outperforms `textMetrics.height()`.

## License

Copyright (c) 2016 Ben Zörb
Licensed under the [MIT license](http://bezoerb.mit-license.org/).

[npm-url]: https://npmjs.org/package/text-metrics
[npm-image]: https://badge.fury.io/js/text-metrics.svg
[travis-url]: https://travis-ci.org/bezoerb/text-metrics
[travis-image]: https://secure.travis-ci.org/bezoerb/text-metrics.svg?branch=master
[depstat-url]: https://david-dm.org/bezoerb/text-metrics
[depstat-image]: https://david-dm.org/bezoerb/text-metrics.svg
[dlcounter-url]: https://www.npmjs.com/package/text-metrics
[dlcounter-image]: https://img.shields.io/npm/dm/text-metrics.svg
[coveralls-url]: https://coveralls.io/github/bezoerb/text-metrics?branch=master
[coveralls-image]: https://coveralls.io/repos/github/bezoerb/text-metrics/badge.svg?branch=master

## License

[MIT](https://bezoerb.mit-license.org/) © [Ben Zörb](http://sommerlaune.com)
