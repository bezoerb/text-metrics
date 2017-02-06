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
    exports.prop = prop;
    exports.normalizeOptions = normalizeOptions;
    exports.getContext2d = getContext2d;
    exports.checkBreak = checkBreak;

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

    function prepareText(text) {
        // convert to unicode
        text = text.replace(/<wbr>/, '\u200B');

        return decode(text).trim();
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
     * @param char
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
        '\u200B'];

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
        var BK = ['\u2028', '\u2029'];

        return B2.includes(chr) && 'B2' || BAI.includes(chr) && 'BAI' || SHY.includes(chr) && 'SHY' || BA.includes(chr) && 'BA' || BB.includes(chr) && 'BB' || BK.includes(chr) && 'BK';
    }
});