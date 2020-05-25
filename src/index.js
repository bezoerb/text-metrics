/* eslint-env es6, browser */
import * as _ from './utils';

class TextMetrics {
  constructor(el, overwrites = {}) {
    if (!_.isElement(el) && _.isObject(el)) {
      this.el = undefined;
      this.overwrites = _.normalizeOptions(el);
    } else {
      this.el = el;
      this.overwrites = _.normalizeOptions(overwrites);
    }

    this.style = _.getStyle(this.el, this.overwrites);
    this.font = _.prop(overwrites, 'font', null) || _.getFont(this.style, this.overwrites);
  }

  padding() {
    return this.el ? parseInt(this.style.paddingLeft || 0, 10) + parseInt(this.style.paddingRight || 0, 10) : 0;
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
      text = _.prepareText(text);
    }

    if (!text) {
      return 0;
    }

    const styledText = _.getStyledText(text, this.style);

    const styles = {...this.overwrites, ..._.normalizeOptions(overwrites)};
    const font = _.getFont(this.style, styles);

    const letterSpacing = _.prop(styles, 'letter-spacing') || this.style.getPropertyValue('letter-spacing');
    const wordSpacing = _.prop(styles, 'word-spacing') || this.style.getPropertyValue('word-spacing');
    const addSpacing = _.addWordAndLetterSpacing(wordSpacing, letterSpacing);

    const ctx = _.getContext2d(font);

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
  height(text, options, overwrites) {
    if (typeof text === 'object' && text) {
      overwrites = options;
      options = text || {};
      text = undefined;
    }

    if (!options) {
      options = {};
    }

    if (!overwrites) {
      options = {};
    }

    if (!text && this.el) {
      text = _.getText(this.el);
    } else {
      text = _.prepareText(text);
    }

    const styles = {...this.overwrites, ..._.normalizeOptions(overwrites)};
    const lineHeight = parseFloat(_.prop(styles, 'line-height') || this.style.getPropertyValue('line-height'));

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
  lines(text, options, overwrites) {
    if (typeof text === 'object' && text) {
      overwrites = options;
      options = text;
      text = undefined;
    }

    if (typeof overwrites === 'undefined') {
      overwrites = options;
    }

    if (!options) {
      options = {};
    }

    if (!overwrites) {
      options = {};
    }

    if (!text && this.el) {
      text = _.getText(this.el);
    } else {
      text = _.prepareText(text);
    }

    const styles = {...this.overwrites, ..._.normalizeOptions(overwrites)};
    const font = _.getFont(this.style, styles);

    // Get max width
    let max =
      parseInt(_.prop(options, 'width') || _.prop(overwrites, 'width'), 10) ||
      _.prop(this.el, 'offsetWidth', 0) ||
      parseInt(_.prop(styles, 'width', 0), 10) ||
      parseInt(this.style.width, 10);

    max -= this.padding();

    const wordBreak = _.prop(styles, 'word-break') || this.style.getPropertyValue('word-break');
    const letterSpacing = _.prop(styles, 'letter-spacing') || this.style.getPropertyValue('letter-spacing');
    const wordSpacing = _.prop(styles, 'word-spacing') || this.style.getPropertyValue('word-spacing');
    const ctx = _.getContext2d(font);
    text = _.getStyledText(text, this.style);

    // Different scenario when break-word is allowed
    if (wordBreak === 'break-all') {
      return _.computeLinesBreakAll({
        ctx,
        text,
        max,
        wordSpacing,
        letterSpacing,
      });
    }

    return _.computeLinesDefault({
      ctx,
      text,
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
  maxFontSize(text, options, overwrites) {
    if (typeof text === 'object' && text) {
      overwrites = options;
      options = text;
      text = undefined;
    }

    if (typeof overwrites === 'undefined') {
      overwrites = options;
    }

    if (!options) {
      options = {};
    }

    if (!overwrites) {
      options = {};
    }

    if (!text && this.el) {
      text = _.getText(this.el);
    } else {
      text = _.prepareText(text);
    }

    const styles = {...this.overwrites, ..._.normalizeOptions(overwrites)};

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
      parseInt(_.prop(options, 'width') || _.prop(overwrites, 'width'), 10) ||
      _.prop(this.el, 'offsetWidth', 0) ||
      parseInt(_.prop(styles, 'width', 0), 10) ||
      parseInt(this.style.width, 10);

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

export const init = (el, overwrites) => new TextMetrics(el, overwrites);

export const utils = {..._};
