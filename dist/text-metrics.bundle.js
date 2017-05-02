(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.textMetrics = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'exports', './utils'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, exports, require('./utils'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, mod.exports, global.utils);
        global.index = mod.exports;
    }
})(this, function (module, exports, _require) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _extends = Object.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];

            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }

        return target;
    };

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var isElement = _require.isElement,
        isObject = _require.isObject,
        getStyle = _require.getStyle,
        getFont = _require.getFont,
        getText = _require.getText,
        getStyledText = _require.getStyledText,
        prepareText = _require.prepareText,
        getContext2d = _require.getContext2d,
        computeLinesDefault = _require.computeLinesDefault,
        computeLinesBreakAll = _require.computeLinesBreakAll,
        normalizeOptions = _require.normalizeOptions,
        addWordAndLetterSpacing = _require.addWordAndLetterSpacing,
        prop = _require.prop;

    var TextMetrics = function () {
        function TextMetrics(el) {
            var overwrites = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            _classCallCheck(this, TextMetrics);

            if (!isElement(el) && isObject(el)) {
                this.el = undefined;
                this.overwrites = normalizeOptions(el);
            } else {
                this.el = el;
                this.overwrites = normalizeOptions(overwrites);
            }

            this.style = getStyle(this.el, this.overwrites);
            this.font = prop(overwrites, 'font', null) || getFont(this.style, this.overwrites);
        }

        /**
         * Compute Text Metrics based for given text
         *
         * @param {string} text
         * @param {object} options
         * @param {object} overwrites
         * @returns {function}
         */


        _createClass(TextMetrics, [{
            key: 'width',
            value: function width(text) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var overwrites = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                if ((typeof text === 'undefined' ? 'undefined' : _typeof(text)) === 'object' && text) {
                    overwrites = options;
                    options = text || {};
                    text = undefined;
                }

                if (!text && this.el) {
                    text = this.el.textContent.trim();
                } else {
                    text = prepareText(text);
                }

                var styledText = getStyledText(text, this.style);

                var styles = _extends({}, this.overwrites, normalizeOptions(overwrites));
                var font = getFont(this.style, styles);

                var letterSpacing = prop(styles, 'letter-spacing') || this.style.getPropertyValue('letter-spacing');
                var wordSpacing = prop(styles, 'word-spacing') || this.style.getPropertyValue('word-spacing');
                var addSpacing = addWordAndLetterSpacing(wordSpacing, letterSpacing);

                var ctx = getContext2d(font);

                if (options.multiline) {
                    return this.lines(styledText, options, overwrites).reduce(function (res, text) {
                        var w = ctx.measureText(text).width + addSpacing(text);

                        return Math.max(res, w);
                    }, 0);
                }

                return ctx.measureText(styledText).width + addSpacing(styledText);
            }
        }, {
            key: 'height',
            value: function height(text) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var overwrites = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                if ((typeof text === 'undefined' ? 'undefined' : _typeof(text)) === 'object' && text) {
                    overwrites = options;
                    options = text || {};
                    text = undefined;
                }

                if (!text && this.el) {
                    text = getText(this.el);
                } else {
                    text = prepareText(text);
                }

                var styles = _extends({}, this.overwrites, normalizeOptions(overwrites));
                var lineHeight = parseInt(prop(styles, 'line-height') || this.style.getPropertyValue('line-height'), 10);

                return this.lines(text, options, styles).length * lineHeight;
            }
        }, {
            key: 'lines',
            value: function lines(text) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var overwrites = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                if ((typeof text === 'undefined' ? 'undefined' : _typeof(text)) === 'object' && text) {
                    overwrites = options;
                    options = text;
                    text = undefined;
                }

                if (!text && this.el) {
                    text = getText(this.el);
                } else {
                    text = prepareText(text);
                }

                var styles = _extends({}, this.overwrites, normalizeOptions(overwrites));
                var font = getFont(this.style, styles);

                // Get max width
                var max = parseInt(prop(options, 'width') || prop(overwrites, 'width') || prop(this.el, 'offsetWidth', 0) || this.style.getPropertyValue('width'), 10);

                var wordBreak = prop(styles, 'word-break') || this.style.getPropertyValue('word-break');
                var letterSpacing = prop(styles, 'letter-spacing') || this.style.getPropertyValue('letter-spacing');
                var wordSpacing = prop(styles, 'word-spacing') || this.style.getPropertyValue('word-spacing');
                var ctx = getContext2d(font);
                text = getStyledText(text, this.style);

                // Different scenario when break-word is allowed
                if (wordBreak === 'break-all') {
                    return computeLinesBreakAll({ ctx: ctx, text: text, max: max, wordSpacing: wordSpacing, letterSpacing: letterSpacing });
                }

                return computeLinesDefault({ ctx: ctx, text: text, max: max, wordSpacing: wordSpacing, letterSpacing: letterSpacing });
            }
        }, {
            key: 'maxFontSize',
            value: function maxFontSize(text) {
                var _this = this;

                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var overwrites = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                if ((typeof text === 'undefined' ? 'undefined' : _typeof(text)) === 'object' && text) {
                    overwrites = options;
                    options = text;
                    text = undefined;
                }

                if (!text && this.el) {
                    text = getText(this.el);
                } else {
                    text = prepareText(text);
                }

                // Simple compute function which adds the size and computes the with
                var compute = function compute(size) {
                    return _this.width(text, options, _extends({}, overwrites, { 'font-size': size + 'px' }));
                };

                // Get max width
                var max = parseInt(prop(options, 'width') || prop(overwrites, 'width') || prop(this.el, 'offsetWidth', 0) || this.style.getPropertyValue('width'), 10);

                // Start with half the max size
                var size = Math.floor(max / 2);
                var cur = compute(size);

                // Compute next result based on first result
                size = Math.floor(size / cur * max);
                cur = compute(size);

                // Happy cause we got it already
                if (Math.ceil(cur) === max) {
                    return size + 'px';
                }

                // Go on by increase/decrease pixels
                if (cur > max && size > 0) {
                    while (cur > max && size > 0) {
                        cur = compute(size--);
                    }
                    return size + 'px';
                }

                while (cur < max) {
                    cur = compute(size++);
                }
                size--;
                return size + 'px';
            }
        }]);

        return TextMetrics;
    }();

    exports.default = function (el, overwrites) {
        return new TextMetrics(el, overwrites);
    };

    module.exports = function (el, overwrites) {
        return new TextMetrics(el, overwrites);
    };
});
},{"./utils":2}],2:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.utils = mod.exports;
    }
})(this, function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.pxValue = pxValue;
    exports.addWordAndLetterSpacing = addWordAndLetterSpacing;
    exports.getFont = getFont;
    exports.isCSSStyleDeclaration = isCSSStyleDeclaration;
    exports.canGetComputedStyle = canGetComputedStyle;
    exports.isElement = isElement;
    exports.isObject = isObject;
    exports.getStyle = getStyle;
    exports.getStyledText = getStyledText;
    exports.prepareText = prepareText;
    exports.getText = getText;
    exports.prop = prop;
    exports.normalizeOptions = normalizeOptions;
    exports.getContext2d = getContext2d;
    exports.checkBreak = checkBreak;
    exports.computeLinesDefault = computeLinesDefault;
    exports.computeLinesBreakAll = computeLinesBreakAll;

    function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
                arr2[i] = arr[i];
            }

            return arr2;
        } else {
            return Array.from(arr);
        }
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    /*
     B2	Break Opportunity Before and After	Em dash	Provide a line break opportunity before and after the character
     BA	Break After	Spaces, hyphens	Generally provide a line break opportunity after the character
     BB	Break Before	Punctuation used in dictionaries	Generally provide a line break opportunity before the character
     HY	Hyphen	HYPHEN-MINUS	Provide a line break opportunity after the character, except in numeric context
     CB	Contingent Break Opportunity	Inline objects	Provide a line break opportunity contingent on additional information
     */

    // B2 Break Opportunity Before and After - http://www.unicode.org/reports/tr14/#B2
    var B2 = ['\u2014'];

    var SHY = [
    // Soft hyphen
    '\xAD'];

    // BA: Break After (remove on break) - http://www.unicode.org/reports/tr14/#BA
    var BAI = [
    // Spaces
    ' ', '\u1680', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2008', '\u2009', '\u200A', '\u205F', '\u3000',
    // Tab
    '\t',
    // ZW Zero Width Space - http://www.unicode.org/reports/tr14/#ZW
    '\u200B',
    // Mandatory breaks not interpreted by html
    '\u2028', '\u2029'];

    var BA = [
    // Hyphen
    '\u058A', '\u2010', '\u2012', '\u2013',
    // Visible Word Dividers
    '\u05BE', '\u0F0B', '\u1361', '\u17D8', '\u17DA', '\u2027', '|',
    // Historic Word Separators
    '\u16EB', '\u16EC', '\u16ED', '\u2056', '\u2058', '\u2059', '\u205A', '\u205B', '\u205D', '\u205E', '\u2E19', '\u2E2A', '\u2E2B', '\u2E2C', '\u2E2D', '\u2E30', '\u10100', '\u10101', '\u10102', '\u1039F', '\u103D0', '\u1091F', '\u12470'];

    // BB: Break Before - http://www.unicode.org/reports/tr14/#BB
    var BB = ['\xB4', '\u1FFD'];

    // BK: Mandatory Break (A) (Non-tailorable) - http://www.unicode.org/reports/tr14/#BK
    var BK = ['\n'];

    /* eslint-env es6, browser */
    var DEFAULTS = exports.DEFAULTS = {
        'font-size': '16px',
        'font-weight': '400',
        'font-family': 'Helvetica, Arial, sans-serif'
    };

    /**
     * We only support rem/em/pt conversion
     * @param val
     * @param options
     * @return {*}
     */
    function pxValue(val) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var baseFontSize = parseInt(prop(options, 'base-font-size', 16), 10);

        var value = parseFloat(val);
        var unit = val.replace(value, '');
        // eslint-disable-next-line default-case
        switch (unit) {
            case 'rem':
            case 'em':
                return value * baseFontSize;
            case 'pt':
                return value / (96 / 72);
            case 'px':
                return value;
        }

        throw new Error('The unit ' + unit + ' is not supported');
    }

    /**
     * Get computed word- and letter spacing for text
     * @param ws
     * @param ls
     * @return {function(*)}
     */
    function addWordAndLetterSpacing(ws, ls) {
        var blacklist = ['inherit', 'initial', 'unset', 'normal'];

        var wordAddon = 0;
        if (ws && blacklist.indexOf(ws) === -1) {
            wordAddon = pxValue(ws);
        }

        var letterAddon = 0;
        if (ls && blacklist.indexOf(ls) === -1) {
            letterAddon = pxValue(ls);
        }

        return function (text) {
            var words = text.trim().replace(/\s+/gi, ' ').split(' ').length - 1;
            var chars = text.length;

            return words * wordAddon + chars * letterAddon;
        };
    }

    /**
     * Map css styles to canvas font property
     *
     * font: font-style font-variant font-weight font-size/line-height font-family;
     * http://www.w3schools.com/tags/canvas_font.asp
     *
     * @param {CSSStyleDeclaration} style
     * @param {object} options
     * @returns {string}
     */
    function getFont(style, options) {
        var font = [];

        var fontWeight = prop(options, 'font-weight', style.getPropertyValue('font-weight')) || DEFAULTS['font-weight'];
        if (['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'].indexOf(fontWeight.toString()) !== -1) {
            font.push(fontWeight);
        }

        var fontStyle = prop(options, 'font-style', style.getPropertyValue('font-style'));
        if (['normal', 'italic', 'oblique'].indexOf(fontStyle) !== -1) {
            font.push(fontStyle);
        }

        var fontVariant = prop(options, 'font-variant', style.getPropertyValue('font-variant'));
        if (['normal', 'small-caps'].indexOf(fontVariant) !== -1) {
            font.push(fontVariant);
        }

        var fontSize = prop(options, 'font-size', style.getPropertyValue('font-size')) || DEFAULTS['font-size'];
        var fontSizeValue = pxValue(fontSize);
        font.push(fontSizeValue + 'px');

        var fontFamily = prop(options, 'font-family', style.getPropertyValue('font-family')) || DEFAULTS['font-family'];
        font.push(fontFamily);

        return font.join(' ');
    }

    /**
     * Check for CSSStyleDeclaration
     *
     * @param val
     * @returns {bool}
     */
    function isCSSStyleDeclaration(val) {
        return val && typeof val.getPropertyValue === 'function';
    }

    /**
     * Check wether we can get computed style
     *
     * @param el
     * @returns {bool}
     */
    function canGetComputedStyle(el) {
        return isElement(el) && el.style && typeof window !== 'undefined' && typeof window.getComputedStyle === 'function';
    }

    /**
     * Check for DOM element
     *
     * @param el
     * @retutns {bool}
     */
    function isElement(el) {
        return (typeof HTMLElement === 'undefined' ? 'undefined' : _typeof(HTMLElement)) === 'object' ? el instanceof HTMLElement : Boolean(el && (typeof el === 'undefined' ? 'undefined' : _typeof(el)) === 'object' && el !== null && el.nodeType === 1 && typeof el.nodeName === 'string');
    }

    /**
     * Check if argument is object
     * @param obj
     * @returns {boolean}
     */
    function isObject(obj) {
        return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj !== null && !Array.isArray(obj);
    }

    /**
     * Get style declaration if available
     *
     * @returns {CSSStyleDeclaration}
     */
    function getStyle(el) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        if (isCSSStyleDeclaration(options.style)) {
            return options.style;
        }

        if (canGetComputedStyle(el)) {
            return window.getComputedStyle(el, prop(options, 'pseudoElt', null));
        }

        return {
            getPropertyValue: function getPropertyValue(key) {
                return prop(options, key);
            }
        };
    }

    /**
     * Get styled text
     *
     * @param {string} text
     * @param {CSSStyleDeclaration} style
     * @returns {string}
     */
    function getStyledText(text, style) {
        switch (style.getPropertyValue('text-transform')) {
            case 'uppercase':
                return text.toUpperCase();
            case 'lowercase':
                return text.toLowerCase();
            default:
                return text;
        }
    }

    /**
     * Trim text and repace some breaking htmlentities for convenience
     * Point user to https://mths.be/he for real htmlentity decode
     * @param text
     * @returns {string}
     */
    function prepareText(text) {
        // Convert to unicode
        text = text.replace(/<wbr>/ig, '\u200B').replace(/<br\s*\/?>/ig, '\n').replace(/&shy;/ig, '\xAD').replace(/&mdash;/ig, '\u2014');

        if (/&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+);/g.test(text) && console) {
            console.error('text-metrics: Found encoded htmlenties. \nYou may want to use https://mths.be/he to decode your text first.');
        }

        return text.trim();
    }

    /**
     * Get textcontent from element
     * Try innerText first
     * @param el
     */
    function getText(el) {
        if (!el) {
            return '';
        }

        var text = el.innerText || el.textContent || '';

        return text.trim();
    }

    /**
     * Get property from src
     *
     * @param src
     * @param attr
     * @param defaultValue
     * @returns {*}
     */
    function prop(src, attr, defaultValue) {
        return src && typeof src[attr] !== 'undefined' && src[attr] || defaultValue;
    }

    /**
     * Normalize options
     *
     * @param options
     * @returns {*}
     */
    function normalizeOptions() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        var opts = {};

        // Normalize keys (fontSize => font-size)
        Object.keys(options).forEach(function (key) {
            var dashedKey = key.replace(/([A-Z])/g, function ($1) {
                return '-' + $1.toLowerCase();
            });
            opts[dashedKey] = options[key];
        });

        return opts;
    }

    /**
     * Get Canvas
     * @param font
     * @throws {Error}
     * @return {Context2d}
     */
    function getContext2d(font) {
        try {
            var ctx = document.createElement('canvas').getContext('2d');
            var dpr = window.devicePixelRatio || 1;
            var bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
            ctx.font = font;
            ctx.setTransform(dpr / bsr, 0, 0, dpr / bsr, 0, 0);
            return ctx;
        } catch (err) {
            throw new Error('Canvas support required');
        }
    }

    /**
     * Check breaking character
     * http://www.unicode.org/reports/tr14/#Table1
     *
     * @param chr
     */
    function checkBreak(chr) {
        return B2.indexOf(chr) !== -1 && 'B2' || BAI.indexOf(chr) !== -1 && 'BAI' || SHY.indexOf(chr) !== -1 && 'SHY' || BA.indexOf(chr) !== -1 && 'BA' || BB.indexOf(chr) !== -1 && 'BB' || BK.indexOf(chr) !== -1 && 'BK';
    }

    function computeLinesDefault(_ref) {
        var ctx = _ref.ctx,
            text = _ref.text,
            max = _ref.max,
            wordSpacing = _ref.wordSpacing,
            letterSpacing = _ref.letterSpacing;

        var addSpacing = addWordAndLetterSpacing(wordSpacing, letterSpacing);
        var lines = [];
        var parts = [];
        var breakpoints = [];
        var line = '';
        var part = '';

        // Compute array of breakpoints
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = text[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var chr = _step.value;

                var type = checkBreak(chr);
                if (type) {
                    breakpoints.push({ chr: chr, type: type });

                    parts.push(part);
                    part = '';
                } else {
                    part += chr;
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        if (part) {
            parts.push(part);
        }

        // Loop over text parts and compute the lines
        for (var i = 0; i < parts.length; i++) {
            if (i === 0) {
                line = parts[i];
                continue;
            }

            var _part = parts[i];
            var breakpoint = breakpoints[i - 1];
            // Special treatment as we only render the soft hyphen if we need to split
            var _chr = breakpoint.type === 'SHY' ? '' : breakpoint.chr;

            if (breakpoint.type === 'BK') {
                lines.push(line);
                line = _part;
                continue;
            }

            // Measure width
            var width = parseInt(ctx.measureText(line + _chr + _part).width + addSpacing(line + _chr + _part), 10);
            // Still fits in line
            if (width <= max) {
                line += _chr + _part;
                continue;
            }

            // Line is to long, we split at the breakpoint
            switch (breakpoint.type) {
                case 'SHY':
                    lines.push(line + '-');
                    line = _part;
                    break;
                case 'BA':
                    lines.push(line + _chr);
                    line = _part;
                    break;
                case 'BAI':
                    lines.push(line);
                    line = _part;
                    break;
                case 'BB':
                    lines.push(line);
                    line = _chr + _part;
                    break;
                case 'B2':
                    if (parseInt(ctx.measureText(line + _chr).width + addSpacing(line + _chr), 10) <= max) {
                        lines.push(line + _chr);
                        line = _part;
                    } else if (parseInt(ctx.measureText(_chr + _part).width + addSpacing(_chr + _part), 10) <= max) {
                        lines.push(line);
                        line = _chr + _part;
                    } else {
                        lines.push(line);
                        lines.push(_chr);
                        line = _part;
                    }
                    break;
                default:
                    throw new Error('Undefoined break');
            }
        }

        if ([].concat(_toConsumableArray(line)).length !== 0) {
            lines.push(line);
        }

        return lines;
    }

    function computeLinesBreakAll(_ref2) {
        var ctx = _ref2.ctx,
            text = _ref2.text,
            max = _ref2.max,
            wordSpacing = _ref2.wordSpacing,
            letterSpacing = _ref2.letterSpacing;

        var addSpacing = addWordAndLetterSpacing(wordSpacing, letterSpacing);
        var lines = [];
        var line = '';
        var index = 0;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = text[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var chr = _step2.value;

                var type = checkBreak(chr);
                // Mandatory break found (br's converted to \u000A and innerText keeps br's as \u000A
                if (type === 'BK') {
                    lines.push(line);
                    line = '';
                    continue;
                }

                // Measure width
                var width = ctx.measureText(line + chr).width + addSpacing(line + chr);
                // Check if we can put char behind the shy
                if (type === 'SHY') {
                    var next = text[index + 1] || '';
                    width = ctx.measureText(line + chr + next).width + addSpacing(line + chr + next);
                }

                // Needs at least one character
                if (width > max && [].concat(_toConsumableArray(line)).length !== 0) {
                    switch (type) {
                        case 'SHY':
                            lines.push(line + '-');
                            line = '';
                            break;
                        case 'BA':
                            lines.push(line + chr);
                            line = '';
                            break;
                        case 'BAI':
                            lines.push(line);
                            line = '';
                            break;
                        default:
                            lines.push(line);
                            line = chr;
                            break;
                    }
                } else if (chr !== '\xAD') {
                    line += chr;
                }
                index++;
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        if ([].concat(_toConsumableArray(line)).length !== 0) {
            lines.push(line);
        }

        return lines;
    }
});
},{}]},{},[1])(1)
});