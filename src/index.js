/* eslint-env es6, browser */
import * as _ from './utils.js';

class TextMetrics {
  constructor(element, overwrites = {}) {
    if (!_.isElement(element) && _.isObject(element)) {
      this.el = undefined;
      this.overwrites = _.normalizeOptions(element);
    } else {
      this.el = element;
      this.overwrites = _.normalizeOptions(overwrites);
    }

    this.style = _.getStyle(this.el, this.overwrites);
    this.font = _.prop(overwrites, 'font', null) || _.getFont(this.style, this.overwrites);
  }

  padding() {
    return this.el
      ? Number.parseInt(this.style.paddingLeft || 0, 10) + Number.parseInt(this.style.paddingRight || 0, 10)
      : 0;
  }

  parseArgs(text, options = {}, overwrites = {}) {
    if (typeof text === 'object' && text) {
      overwrites = options;
      options = text || {};
      text = undefined;
    }

    const styles = {...this.overwrites, ..._.normalizeOptions(overwrites)};
    const ws = _.prop(styles, 'white-space') || this.style.getPropertyValue('white-space');

    if (!options) {
      options = {};
    }

    if (!overwrites) {
      options = {};
    }

    text =
      !text && this.el ? _.normalizeWhitespace(_.getText(this.el), ws) : _.prepareText(_.normalizeWhitespace(text, ws));

    return {text, options, overwrites, styles};
  }

  /**
   * Compute Text Metrics based for given text
   *
   * @param {string} text
   * @param {object} options
   * @param {object} overwrites
   * @returns {function}
   */
  width(...args) {
    const {text, options, overwrites, styles} = this.parseArgs(...args);

    if (!text) {
      return 0;
    }

    const font = _.getFont(this.style, styles);
    const letterSpacing = _.prop(styles, 'letter-spacing') || this.style.getPropertyValue('letter-spacing');
    const wordSpacing = _.prop(styles, 'word-spacing') || this.style.getPropertyValue('word-spacing');
    const addSpacing = _.addWordAndLetterSpacing(wordSpacing, letterSpacing);
    const ctx = _.getContext2d(font);
    const styledText = _.getStyledText(text, this.style);

    if (options.multiline) {
      // eslint-disable-next-line unicorn/no-array-reduce
      return this.lines(styledText, options, overwrites).reduce((result, text) => {
        const w = ctx.measureText(text).width + addSpacing(text);

        return Math.max(result, w);
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
  height(...args) {
    const {text, options, styles} = this.parseArgs(...args);

    const lineHeight = Number.parseFloat(_.prop(styles, 'line-height') || this.style.getPropertyValue('line-height'));

    return Math.ceil(this.lines(text, options, styles).length * lineHeight || 0);
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
  lines(...args) {
    const {text, options, overwrites, styles} = this.parseArgs(...args);

    const font = _.getFont(this.style, styles);

    // Get max width
    let max =
      Number.parseInt(_.prop(options, 'width') || _.prop(overwrites, 'width'), 10) ||
      _.prop(this.el, 'offsetWidth', 0) ||
      Number.parseInt(_.prop(styles, 'width', 0), 10) ||
      Number.parseInt(this.style.width, 10);

    max -= this.padding();

    const wordBreak = _.prop(styles, 'word-break') || this.style.getPropertyValue('word-break');
    const letterSpacing = _.prop(styles, 'letter-spacing') || this.style.getPropertyValue('letter-spacing');
    const wordSpacing = _.prop(styles, 'word-spacing') || this.style.getPropertyValue('word-spacing');
    const ctx = _.getContext2d(font);
    const styledText = _.getStyledText(text, this.style);

    // Different scenario when break-word is allowed
    if (wordBreak === 'break-all') {
      return _.computeLinesBreakAll({
        ctx,
        text: styledText,
        max,
        wordSpacing,
        letterSpacing,
      });
    }

    return _.computeLinesDefault({
      ctx,
      text: styledText,
      max,
      wordSpacing,
      letterSpacing,
    });
  }

  /**
   * Compute Text Metrics based for given text
   *
   * @param {string} text
   * @param {object} options
   * @param {object} overwrites
   * @returns {string} Pixelvalue e.g. 14px
   */
  maxFontSize(...args) {
    const {text, options, overwrites, styles} = this.parseArgs(...args);

    // Simple compute function which adds the size and computes the with
    const compute = (size) => {
      return Math.ceil(
        this.width(text, options, {
          ...styles,
          'font-size': size + 'px',
        })
      );
    };

    // Get max width
    let max =
      Number.parseInt(_.prop(options, 'width') || _.prop(overwrites, 'width'), 10) ||
      _.prop(this.el, 'offsetWidth', 0) ||
      Number.parseInt(_.prop(styles, 'width', 0), 10) ||
      Number.parseInt(this.style.width, 10);

    max -= this.padding();

    // Start with half the max size
    let size = Math.floor(max / 2);
    let cur = compute(size);

    // Compute next result based on first result
    size = Math.floor((size / cur) * max);
    cur = compute(size);

    // Happy cause we got it already
    if (Math.ceil(cur) === max) {
      return size ? size + 'px' : undefined;
    }

    // Go on by increase/decrease pixels
    const greater = cur > max && size > 0;
    while (cur > max && size > 0) {
      size -= 1;
      cur = compute(size);
    }

    if (!greater) {
      while (cur < max) {
        cur = compute(size + 1);
        if (cur > max) {
          return size ? size + 'px' : undefined;
        }

        size += 1;
      }
    }

    return size ? size + 'px' : undefined;
  }
}

export const init = (element, overwrites) => new TextMetrics(element, overwrites);

export const utils = {..._};
