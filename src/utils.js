/* eslint-env es6, browser */
export const DEFAULTS = {
    'font-size': '16px',
    'font-weight': '400',
    'font-family': 'Helvetica, Arial, sans-serif'
};

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
    let fontSizeValue = parseFloat(fontSize);
    let fontSizeUnit = fontSize.replace(fontSizeValue, '');
    // eslint-disable-next-line default-case
    switch (fontSizeUnit) {
        case 'rem':
        case 'em':
            fontSizeValue *= 16;
            break;
        case 'pt':
            fontSizeValue /= 0.75;
            break;

    }

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
