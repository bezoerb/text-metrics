(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'he'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('he'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.he);
        global.utils = mod.exports;
    }
})(this, function (exports, _require) {
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
    exports.computeLinesBreakAll = computeLinesBreakAll;
    exports.computeLinesDefault = computeLinesDefault;

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

    var decode = _require.decode;


    /* eslint-env es6, browser */
    var DEFAULTS = exports.DEFAULTS = {
        'font-size': '16px',
        'font-weight': '400',
        'font-family': 'Helvetica, Arial, sans-serif'
    };

    /**
     * we only support rem/em/pt conversion
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
     * check for CSSStyleDeclaration
     *
     * @param val
     * @returns {bool}
     */
    function isCSSStyleDeclaration(val) {
        return val && typeof val.getPropertyValue === 'function';
    }

    /**
     * check wether we can get computed style
     *
     * @param el
     * @returns {bool}
     */
    function canGetComputedStyle(el) {
        return isElement(el) && el.style && typeof window !== 'undefined' && typeof window.getComputedStyle === 'function';
    }

    /**
     * check for DOM element
     *
     * @param el
     * @retutns {bool}
     */
    function isElement(el) {
        return (typeof HTMLElement === 'undefined' ? 'undefined' : _typeof(HTMLElement)) === 'object' ? el instanceof HTMLElement : Boolean(el && (typeof el === 'undefined' ? 'undefined' : _typeof(el)) === 'object' && el !== null && el.nodeType === 1 && typeof el.nodeName === 'string');
    }

    /**
     * check if argument is object
     * @param obj
     * @returns {boolean}
     */
    function isObject(obj) {
        return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj !== null && !(obj instanceof Array);
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
     * get styled text
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
     * Get cleaned text
     * @param text
     * @returns {string}
     */
    function prepareText(text) {
        // convert to unicode
        text = text.replace(/<wbr>/, '\u200B').replace(/<br\s*\/?>/, '\n');

        return decode(text).trim();
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

        // normalize keys (fontSize => font-size)
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
            ctx.font = font;
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
        // soft hyphen
        '\xAD'];

        // BA: Break After (remove on break) - http://www.unicode.org/reports/tr14/#BA
        var BAI = [
        // spaces
        ' ', '\u1680', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2008', '\u2009', '\u200A', '\u205F', '\u3000',
        // tab
        '\t',
        // ZW Zero Width Space - http://www.unicode.org/reports/tr14/#ZW
        '\u200B',
        // Mandatory breaks not interpreted by html
        '\u2028', '\u2029'];

        var BA = [
        // hyphen
        '\u058A', '\u2010', '\u2012', '\u2013',
        // Visible Word Dividers
        '\u05BE', '\u0F0B', '\u1361', '\u17D8', '\u17DA', '\u2027', '|',
        // Historic Word Separators
        '\u16EB', '\u16EC', '\u16ED', '\u2056', '\u2058', '\u2059', '\u205A', '\u205B', '\u205D', '\u205E', '\u2E19', '\u2E2A', '\u2E2B', '\u2E2C', '\u2E2D', '\u2E30', '\u10100', '\u10101', '\u10102', '\u1039F', '\u103D0', '\u1091F', '\u12470'];

        // BB: Break Before - http://www.unicode.org/reports/tr14/#BB
        var BB = ['\xB4', '\u1FFD'];

        // BK: Mandatory Break (A) (Non-tailorable) - http://www.unicode.org/reports/tr14/#BK
        var BK = ['\n'];

        return B2.indexOf(chr) !== -1 && 'B2' || BAI.indexOf(chr) !== -1 && 'BAI' || SHY.indexOf(chr) !== -1 && 'SHY' || BA.indexOf(chr) !== -1 && 'BA' || BB.indexOf(chr) !== -1 && 'BB' || BK.indexOf(chr) !== -1 && 'BK';
    }

    function computeLinesBreakAll(_ref) {
        var ctx = _ref.ctx,
            text = _ref.text,
            max = _ref.max,
            wordSpacing = _ref.wordSpacing,
            letterSpacing = _ref.letterSpacing;

        var addSpacing = addWordAndLetterSpacing(wordSpacing, letterSpacing);
        var lines = [];
        var line = '';

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = text[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var chr = _step.value;

                var type = checkBreak(chr);
                // mandatory break found (br's converted to \u000A and innerText keeps br's as \u000A
                if (type === 'BK') {
                    lines.push(line);
                    line = '';
                    continue;
                }

                // measure width
                var width = ctx.measureText(line + chr).width + addSpacing(line + chr);

                // needs at least one character
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
                } else {
                    line += chr;
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

        if ([].concat(_toConsumableArray(line)).length !== 0) {
            lines.push(line);
        }

        return lines;
    }

    function computeLinesDefault(_ref2) {
        var ctx = _ref2.ctx,
            text = _ref2.text,
            max = _ref2.max,
            wordSpacing = _ref2.wordSpacing,
            letterSpacing = _ref2.letterSpacing;

        var addSpacing = addWordAndLetterSpacing(wordSpacing, letterSpacing);
        var lines = [];
        var line = '';
        var lpb = void 0;
        var index = 0;

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = text[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var chr = _step2.value;

                var type = checkBreak(chr);

                // mandatory break found (br's converted to \u000A and innerText keeps br's as \u000A
                if (type === 'BK') {
                    lines.push(line);
                    line = '';
                    index = 0;
                    continue;
                }

                // use es2015 array to count code points properly
                // https://mathiasbynens.be/notes/javascript-unicode
                var lineArray = [].concat(_toConsumableArray(line));

                if (type && lineArray.length !== 0) {
                    lpb = { type: type, index: index, chr: chr };
                }

                // measure width
                var width = ctx.measureText(line + chr).width + addSpacing(line + chr);

                // needs at least one character
                if (width > max && lineArray.length !== 0 && lpb) {
                    var nl = lineArray.slice(0, lpb.index).join('');
                    // the break character is handled in the switch statement below
                    if (lpb.index === index) {
                        line = '';
                    } else {
                        line = lineArray.slice(lpb.index + 1).join('') + chr;
                    }
                    index = [].concat(_toConsumableArray(line)).length;
                    switch (lpb.type) {
                        case 'SHY':
                            lines.push(nl + '-');
                            lpb = undefined;
                            break;
                        case 'BA':
                            lines.push(nl + lpb.chr);
                            lpb = undefined;
                            break;
                        case 'BK':
                        case 'BAI':
                            lines.push(nl);
                            lpb = undefined;
                            break;
                        case 'BB':
                            lines.push(nl);
                            line = lpb.chr + line;
                            lpb = undefined;
                            break;
                        case 'B2':
                            if (ctx.measureText(nl + lpb.chr).width + addSpacing(nl + lpb.chr) <= max) {
                                lines.push(nl + lpb.chr);
                                lpb = undefined;
                            } else {
                                lines.push(nl);
                                line = lpb.chr + line;
                                lpb.index = 0;
                                index++;
                            }
                            break;
                        default:
                            throw new Error('Undefoined break');
                    }
                } else {
                    if (chr !== '\xAD') {
                        line += chr;
                    }
                    index++;
                }
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