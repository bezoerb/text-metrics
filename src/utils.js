const {decode} = require('he');

/* eslint-env es6, browser */
export const DEFAULTS = {
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
export function pxValue(val, options = {}) {
    const baseFontSize = parseInt(prop(options, 'base-font-size', 16), 10);

    let value = parseFloat(val);
    let unit = val.replace(value, '');
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

    throw new Error(`The unit ${unit} is not supported`);
}

/**
 * Get computed word- and letter spacing for text
 * @param ws
 * @param ls
 * @return {function(*)}
 */
export function addWordAndLetterSpacing(ws, ls) {
    const blacklist = ['inherit', 'initial', 'unset', 'normal'];

    let wordAddon = 0;
    if (ws && blacklist.indexOf(ws) === -1) {
        wordAddon = pxValue(ws);
    }

    let letterAddon = 0;
    if (ls && blacklist.indexOf(ls) === -1) {
        letterAddon = pxValue(ls);
    }

    return text => {
        const words = text.trim().replace(/\s+/gi, ' ').split(' ').length - 1;
        const chars = text.length;

        return (words * wordAddon) + (chars * letterAddon);
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
export function getFont(style, options) {
    let font = [];

    const fontWeight = prop(options, 'font-weight', style.getPropertyValue('font-weight')) || DEFAULTS['font-weight'];
    if (['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'].indexOf(fontWeight.toString()) !== -1) {
        font.push(fontWeight);
    }

    const fontStyle = prop(options, 'font-style', style.getPropertyValue('font-style'));
    if (['normal', 'italic', 'oblique'].indexOf(fontStyle) !== -1) {
        font.push(fontStyle);
    }

    const fontVariant = prop(options, 'font-variant', style.getPropertyValue('font-variant'));
    if (['normal', 'small-caps'].indexOf(fontVariant) !== -1) {
        font.push(fontVariant);
    }

    const fontSize = prop(options, 'font-size', style.getPropertyValue('font-size')) || DEFAULTS['font-size'];
    let fontSizeValue = pxValue(fontSize);
    font.push(fontSizeValue + 'px');

    const fontFamily = prop(options, 'font-family', style.getPropertyValue('font-family')) || DEFAULTS['font-family'];
    font.push(fontFamily);

    return font.join(' ');
}

/**
 * check for CSSStyleDeclaration
 *
 * @param val
 * @returns {bool}
 */
export function isCSSStyleDeclaration(val) {
    return val && typeof val.getPropertyValue === 'function';
}

/**
 * check wether we can get computed style
 *
 * @param el
 * @returns {bool}
 */
export function canGetComputedStyle(el) {
    return isElement(el) && el.style && typeof window !== 'undefined' && typeof window.getComputedStyle === 'function';
}

/**
 * check for DOM element
 *
 * @param el
 * @retutns {bool}
 */
export function isElement(el) {
    return (
        typeof HTMLElement === 'object' ? el instanceof HTMLElement :
            Boolean(el && typeof el === 'object' && el !== null && el.nodeType === 1 && typeof el.nodeName === 'string')
    );
}

/**
 * check if argument is object
 * @param obj
 * @returns {boolean}
 */
export function isObject(obj) {
    return typeof obj === 'object' && obj !== null && !(obj instanceof Array);
}

/**
 * Get style declaration if available
 *
 * @returns {CSSStyleDeclaration}
 */
export function getStyle(el, options = {}) {
    if (isCSSStyleDeclaration(options.style)) {
        return options.style;
    }

    if (canGetComputedStyle(el)) {
        return window.getComputedStyle(el, prop(options, 'pseudoElt', null));
    }

    return {
        getPropertyValue: key => prop(options, key)
    };
}

/**
 * get styled text
 *
 * @param {string} text
 * @param {CSSStyleDeclaration} style
 * @returns {string}
 */
export function getStyledText(text, style) {
    switch (style.getPropertyValue('text-transform')) {
        case 'uppercase':
            return text.toUpperCase();
        case 'lowercase':
            return text.toLowerCase();
        default:
            return text;
    }
}

export function prepareText(text) {
    // convert to unicode
    text = text.replace(/<wbr>/, '\u200b');

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
export function prop(src, attr, defaultValue) {
    return (src && typeof src[attr] !== 'undefined' && src[attr]) || defaultValue;
}

/**
 * Normalize options
 *
 * @param options
 * @returns {*}
 */
export function normalizeOptions(options = {}) {
    const opts = {};

    // normalize keys (fontSize => font-size)
    Object.keys(options).forEach(key => {
        const dashedKey = key.replace(/([A-Z])/g, $1 => `-${$1.toLowerCase()}`);
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
export function getContext2d(font) {
    try {
        const ctx = document.createElement('canvas').getContext('2d');
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
export function checkBreak(chr) {
    /*
     B2	Break Opportunity Before and After	Em dash	Provide a line break opportunity before and after the character
     BA	Break After	Spaces, hyphens	Generally provide a line break opportunity after the character
     BB	Break Before	Punctuation used in dictionaries	Generally provide a line break opportunity before the character
     HY	Hyphen	HYPHEN-MINUS	Provide a line break opportunity after the character, except in numeric context
     CB	Contingent Break Opportunity	Inline objects	Provide a line break opportunity contingent on additional information
     */

    // B2 Break Opportunity Before and After - http://www.unicode.org/reports/tr14/#B2
    const B2 = [
        '\u2014'
    ];

    const SHY = [
        // soft hyphen
        '\u00AD'
    ];

    // BA: Break After (remove on break) - http://www.unicode.org/reports/tr14/#BA
    const BAI = [
        // spaces
        '\u0020', '\u1680', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2008', '\u2009', '\u200A', '\u205F', '\u3000',
        // tab
        '\u0009',
        // ZW Zero Width Space - http://www.unicode.org/reports/tr14/#ZW
        '\u200b'
    ];

    const BA = [
        // hyphen
        '\u058A', '\u2010', '\u2012', '\u2013',
        // Visible Word Dividers
        '\u05BE', '\u0F0B', '\u1361', '\u17D8', '\u17DA', '\u2027', '\u007C',
        // Historic Word Separators
        '\u16EB', '\u16EC', '\u16ED', '\u2056', '\u2058', '\u2059', '\u205A', '\u205B', '\u205D', '\u205E', '\u2E19', '\u2E2A',
        '\u2E2B', '\u2E2C', '\u2E2D', '\u2E30', '\u10100', '\u10101', '\u10102', '\u1039F', '\u103D0', '\u1091F', '\u12470'
    ];

    // BB: Break Before - http://www.unicode.org/reports/tr14/#BB
    const BB = [
        '\u00B4', '\u1FFD'
    ];

    // BK: Mandatory Break (A) (Non-tailorable) - http://www.unicode.org/reports/tr14/#BK
    const BK = [
        '\u2028', '\u2029'
    ];

    return (B2.includes(chr) && 'B2') ||
        (BAI.includes(chr) && 'BAI') ||
        (SHY.includes(chr) && 'SHY') ||
        (BA.includes(chr) && 'BA') ||
        (BB.includes(chr) && 'BB') ||
        (BK.includes(chr) && 'BK');
}
