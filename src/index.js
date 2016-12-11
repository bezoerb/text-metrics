/* eslint-env es6, browser */
const {
    isElement,
    isObject,
    getStyle,
    getFont,
    getStyledText,
    getContext2d,
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
        if (!text && this.el) {
            text = this.el.textContent;
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
            text = this.el.textContent;
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
            text = this.el.textContent;
        }

        const styles = {...this.overwrites, ...normalizeOptions(overwrites)};
        const font = getFont(this.style, styles);

        // get max width
        const delimiter = prop(options, 'delimiter', ' ');
        const max = parseInt(
                prop(options, 'width') ||
                prop(overwrites, 'width') ||
                prop(this.el, 'offsetWidth', 0) ||
                this.style.getPropertyValue('width')
            , 10);

        const letterSpacing = prop(styles, 'letter-spacing') || this.style.getPropertyValue('letter-spacing');
        const wordSpacing = prop(styles, 'word-spacing') || this.style.getPropertyValue('word-spacing');
        const addSpacing = addWordAndLetterSpacing(wordSpacing, letterSpacing);

        const styledText = getStyledText(text, this.style);
        const words = styledText.split(delimiter);

        if (text.length === 0 || words.length === 0) {
            return 0;
        }

        let lines = [];
        let line = words.shift();

        const ctx = getContext2d(font);

        words.forEach((word, index) => {
            const width = ctx.measureText(line + delimiter + word).width + addSpacing(line + delimiter + word);

            if (width <= max) {
                line += (delimiter + word);
            } else {
                lines.push(line);
                line = word;
            }

            if (index === words.length - 1) {
                lines.push(line);
            }
        });

        if (words.length === 0) {
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
            text = this.el.textContent;
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
