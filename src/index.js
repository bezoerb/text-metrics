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

    options ||= {};

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
  width(...arguments_) {
    const {text, options, overwrites, styles} = this.parseArgs(...arguments_);

    if (!text) {
      return 0;
    }

    const font = _.getFont(this.style, styles);
    const letterSpacing = _.prop(styles, 'letter-spacing') || this.style.getPropertyValue('letter-spacing');
    const wordSpacing = _.prop(styles, 'word-spacing') || this.style.getPropertyValue('word-spacing');
    const addSpacing = _.addWordAndLetterSpacing(wordSpacing, letterSpacing);
    const context = _.getContext2d(font);
    const styledText = _.getStyledText(text, this.style);

    if (options.multiline) {
      // eslint-disable-next-line unicorn/no-array-reduce
      return this.lines(styledText, options, overwrites).reduce((result, text) => {
        const w = context.measureText(text).width + addSpacing(text);

        return Math.max(result, w);
      }, 0);
    }

    return context.measureText(styledText).width + addSpacing(styledText);
  }

  /**
   * Compute height from textbox
   *
   * @param {string} text
   * @param {object} options
   * @param {object} overwrites
   * @returns {number}
   */
  height(...arguments_) {
    const {text, options, styles} = this.parseArgs(...arguments_);

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
  lines(...arguments_) {
    const {text, options, overwrites, styles} = this.parseArgs(...arguments_);

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
    const context = _.getContext2d(font);
    const styledText = _.getStyledText(text, this.style);

    // Different scenario when break-word is allowed
    if (wordBreak === 'break-all') {
      return _.computeLinesBreakAll({
        ctx: context,
        text: styledText,
        max,
        wordSpacing,
        letterSpacing,
      });
    }

    return _.computeLinesDefault({
      ctx: context,
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
  maxFontSize(...arguments_) {
    const {text, options, overwrites, styles} = this.parseArgs(...arguments_);

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
    let current = compute(size);

    // Compute next result based on first result
    size = Math.floor((size / current) * max);
    current = compute(size);

    // Happy cause we got it already
    if (Math.ceil(current) === max) {
      return size ? size + 'px' : undefined;
    }

    // Go on by increase/decrease pixels
    const greater = current > max && size > 0;
    while (current > max && size > 0) {
      size -= 1;
      current = compute(size);
    }

    if (!greater) {
      while (current < max) {
        current = compute(size + 1);
        if (current > max) {
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
