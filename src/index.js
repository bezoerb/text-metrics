/* eslint-env es6, browser */
const {
    isElement,
    isObject,
    getStyle,
    getFont,
    getText,
    getStyledText,
    prepareText,
    getContext2d,
    computeLinesDefault,
    computeLinesBreakAll,
    normalizeOptions,
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
        if (typeof text === 'object' && text) {
            overwrites = options;
            options = text || {};
            text = undefined;
        }

        if (!text && this.el) {
            text = this.el.textContent.trim();
        } else {
            text = prepareText(text);
        }

        const styledText = getStyledText(text, this.style);

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
        if (typeof text === 'object' && text) {
            overwrites = options;
            options = text || {};
            text = undefined;
        }

        if (!text && this.el) {
            text = getText(this.el);
        } else {
            text = prepareText(text);
        }

        const styles = {...this.overwrites, ...normalizeOptions(overwrites)};
        const lineHeight = parseInt(prop(styles, 'line-height') || this.style.getPropertyValue('line-height'), 10);

        return this.lines(text, options, styles).length * lineHeight;
    }

    /**
     * Compute lines of text with automatic word wraparound
     * element styles
     *
     * @param {string} text
     * @param {object} options
     * @param {object} overwrites
     * @returns {*}
     */
    lines(text, options = {}, overwrites = {}) {
        if (typeof text === 'object' && text) {
            overwrites = options;
            options = text;
            text = undefined;
        }

        if (!text && this.el) {
            text = getText(this.el);
        } else {
            text = prepareText(text);
        }

        const styles = {...this.overwrites, ...normalizeOptions(overwrites)};
        const font = getFont(this.style, styles);

        // Get max width
        const max = parseInt(
            prop(options, 'width') ||
            prop(overwrites, 'width') ||
            prop(this.el, 'offsetWidth', 0) ||
            this.style.getPropertyValue('width')
            , 10);

        const wordBreak = prop(styles, 'word-break') || this.style.getPropertyValue('word-break');
        const letterSpacing = prop(styles, 'letter-spacing') || this.style.getPropertyValue('letter-spacing');
        const wordSpacing = prop(styles, 'word-spacing') || this.style.getPropertyValue('word-spacing');
        const ctx = getContext2d(font);
        text = getStyledText(text, this.style);

        // Different scenario when break-word is allowed
        if (wordBreak === 'break-all') {
            return computeLinesBreakAll({ctx, text, max, wordSpacing, letterSpacing});
        }

        return computeLinesDefault({ctx, text, max, wordSpacing, letterSpacing});
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
        if (typeof text === 'object' && text) {
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
        const compute = size => {
            return this.width(text, options, {...overwrites, 'font-size': `${size}px`});
        };

        // Get max width
        const max = parseInt(
            prop(options, 'width') ||
            prop(overwrites, 'width') ||
            prop(this.el, 'offsetWidth', 0) ||
            this.style.getPropertyValue('width')
            , 10);

        // Start with half the max size
        let size = Math.floor(max / 2);
        let cur = compute(size);

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
}

export default (el, overwrites) => new TextMetrics(el, overwrites);

module.exports = function (el, overwrites) {
    return new TextMetrics(el, overwrites);
};
