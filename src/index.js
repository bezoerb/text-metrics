/* eslint-env es6, browser */
const {
    isElement,
    isObject,
    getStyle,
    getFont,
    getStyledText,
    prepareText,
    getContext2d,
    normalizeOptions,
    checkBreak,
    addWordAndLetterSpacing,
    prop
} = require('./utils');

class TextMetrics {
    constructor(el, overwrites = {}) {
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
    width(text, options = {}, overwrites = {}) {
        if (!text && this.el) {
            text = this.el.textContent.trim();
        } else {
            text = prepareText(text);
        }

        let styledText = getStyledText(text, this.style);

        const styles = {...this.overwrites, ...normalizeOptions(overwrites)};
        const font = getFont(this.style, styles);

        const letterSpacing = prop(styles, 'letter-spacing') || this.style.getPropertyValue('letter-spacing');
        const wordSpacing = prop(styles, 'word-spacing') || this.style.getPropertyValue('word-spacing');
        const addSpacing = addWordAndLetterSpacing(wordSpacing, letterSpacing);

        const ctx = getContext2d(font);

        if (options.multiline) {
            return this.lines(styledText, options, overwrites).reduce((res, text) => {
                const w = ctx.measureText(text).width + addSpacing(text);

                return Math.max(res, w);
            }, 0);
        }

        return ctx.measureText(styledText).width + addSpacing(styledText);
    }

    /**
     * Compute height from textbox
     *
     * @param {string} text
     * @param {object} options
     * @param {object} overwrites
     * @returns {number}
     */
    height(text, options = {}, overwrites = {}) {
        if (!text && this.el) {
            text = this.el.textContent.trim();
        } else {
            text = prepareText(text);
        }

        const styles = {...this.overwrites, ...normalizeOptions(overwrites)};

        const lineHeight = parseInt(prop(styles, 'line-height') || this.style.getPropertyValue('line-height'), 10);

        return this.lines(text, options, styles).length * lineHeight;
    }

    /**
     * compute lines of text with automatic word wraparound
     * element styles
     *
     * @param {string} text
     * @param {object} options
     * @param {object} overwrites
     * @returns {*}
     */
    lines(text, options = {}, overwrites = {}) {
        if (!text && this.el) {
            text = this.el.textContent.trim();
        } else {
            text = prepareText(text);
        }

        const styles = {...this.overwrites, ...normalizeOptions(overwrites)};
        const font = getFont(this.style, styles);

        // get max width
        const delimiter = prop(options, 'delimiter', /[\u0020,\u1680,\u2000,\u2001,\u2002,\u2003,\u2004,\u2005,\u2006,\u2008,\u2009,\u200A,\u205F,\u3000]/);
        const max = parseInt(
                prop(options, 'width') ||
                prop(overwrites, 'width') ||
                prop(this.el, 'offsetWidth', 0) ||
                this.style.getPropertyValue('width')
            , 10);

        const breakWord = prop(styles, 'word-break') === 'break-all';

        const letterSpacing = prop(styles, 'letter-spacing') || this.style.getPropertyValue('letter-spacing');
        const wordSpacing = prop(styles, 'word-spacing') || this.style.getPropertyValue('word-spacing');
        const addSpacing = addWordAndLetterSpacing(wordSpacing, letterSpacing);

        const styledText = getStyledText(text, this.style);
        const words = styledText.split(delimiter);

        if (text.length === 0 || words.length === 0) {
            return 0;
        }

        const ctx = getContext2d(font);
        const lines = [];

        let line = '';

        // different scenario when break-word is allowed
        if (breakWord) {
            for (let chr of styledText) {
                // measure width
                const width = ctx.measureText(line + chr).width + addSpacing(line + chr);

                // needs at least one character
                if (width > max && [...line].length !== 0) {
                    switch (checkBreak(chr)) {
                        case 'SHY':
                            lines.push(line + '-');
                            line = '';
                            break;
                        case 'BA':
                            lines.push(line + chr);
                            line = '';
                            break;
                        case 'BK':
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
        } else {
            // last possible break
            let lpb;
            let index = 0;

            for (let chr of styledText) {
                // measure width
                const width = ctx.measureText(line + chr).width + addSpacing(line + chr);
                const type = checkBreak(chr);

                // use es2015 array to count code points properly
                // https://mathiasbynens.be/notes/javascript-unicode
                const lineArray = [...line];

                if (type && lineArray.length !== 0) {
                    lpb = {type, index, chr};
                }

                // needs at least one character
                if (width > max && lineArray.length !== 0 && lpb) {
                    let nl = lineArray.slice(0, lpb.index).join('');
                    // the break character is handled in the switch statement below
                    if (lpb.index === index) {
                        line = '';
                    } else {
                        line = lineArray.slice(lpb.index + 1).join('') + chr;
                    }
                    index = [...line].length;
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
                    if (chr !== '\u00AD') {
                        line += chr;
                    }
                    index++;
                }
            }
        }

        if ([...line].length !== 0) {
            lines.push(line);
        }

        return lines;
    }

    /**
     * Compute Text Metrics based for given text
     *
     * @param {string} text
     * @param {object} options
     * @param {object} overwrites
     * @returns {string} Pixelvalue e.g. 14px
     */
    maxFontSize(text, options = {}, overwrites = {}) {
        if (!text && this.el) {
            text = this.el.textContent.trim();
        } else {
            text = prepareText(text);
        }

        // simple compute function which adds the size and computes the with
        let compute = size => {
            return this.width(text, options, {...overwrites, 'font-size': `${size}px`});
        };

        // get max width
        const max = parseInt(
                prop(options, 'width') ||
                prop(overwrites, 'width') ||
                prop(this.el, 'offsetWidth', 0) ||
                this.style.getPropertyValue('width')
            , 10);

        // start with half the max size
        let size = Math.floor(max / 2);
        let cur = compute(size);

        // compute next result based on first result
        size = Math.floor(size / cur * max);
        cur = compute(size);

        // happy cause we got it already
        if (Math.ceil(cur) === max) {
            return size + 'px';
        }

        // go on by increase/decrease pixels
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
}

export default (el, overwrites) => new TextMetrics(el, overwrites);

module.exports = function (el, overwrites) {
    return new TextMetrics(el, overwrites);
};
