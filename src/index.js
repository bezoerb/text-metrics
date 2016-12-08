/* eslint-env es6, browser */
const {
    isElement,
    isObject,
    getStyle,
    getFont,
    getStyledText,
    getContext2d,
    normalizeOptions,
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
        let styledText = getStyledText(text, this.style);

        const styles = {...this.overwrites, ...normalizeOptions(overwrites)};
        const font = getFont(this.style, styles);

        const ctx = getContext2d(font);

        if (options.multiline) {
            return this.lines(styledText, options).reduce((res, text) => {
                return Math.max(res, ctx.measureText(text).width);
            }, 0);
        }

        return ctx.measureText(styledText).width;
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

        const styledText = getStyledText(text, this.style);
        const words = styledText.split(delimiter);

        if (text.length === 0 || words.length === 0) {
            return 0;
        }

        const ctx = getContext2d(font);

        let lines = [];
        let line = words.shift();

        words.forEach((word, index) => {
            const {width} = ctx.measureText(line + delimiter + word);

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

module.exports = function (el, options) {
    return new TextMetrics(el, options);
};
