(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'exports', './utils'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, exports, require('./utils'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, mod.exports, global.utils);
        global.index = mod.exports;
    }
})(this, function (module, exports, _require) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _extends = Object.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];

            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }

        return target;
    };

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var isElement = _require.isElement,
        isObject = _require.isObject,
        getStyle = _require.getStyle,
        getFont = _require.getFont,
        getStyledText = _require.getStyledText,
        getContext2d = _require.getContext2d,
        normalizeOptions = _require.normalizeOptions,
        addWordAndLetterSpacing = _require.addWordAndLetterSpacing,
        prop = _require.prop;

    var TextMetrics = function () {
        function TextMetrics(el) {
            var overwrites = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            _classCallCheck(this, TextMetrics);

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


        _createClass(TextMetrics, [{
            key: 'width',
            value: function width(text) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var overwrites = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                if (!text && this.el) {
                    text = this.el.textContent;
                }

                var styledText = getStyledText(text, this.style);

                var styles = _extends({}, this.overwrites, normalizeOptions(overwrites));
                var font = getFont(this.style, styles);

                var letterSpacing = prop(styles, 'letter-spacing') || this.style.getPropertyValue('letter-spacing');
                var wordSpacing = prop(styles, 'word-spacing') || this.style.getPropertyValue('word-spacing');
                var addSpacing = addWordAndLetterSpacing(wordSpacing, letterSpacing);

                var ctx = getContext2d(font);

                if (options.multiline) {
                    return this.lines(styledText, options).reduce(function (res, text) {
                        var w = ctx.measureText(text).width + addSpacing(text);

                        return Math.max(res, w);
                    }, 0);
                }

                return ctx.measureText(styledText).width + addSpacing(styledText);
            }
        }, {
            key: 'height',
            value: function height(text) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var overwrites = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                if (!text && this.el) {
                    text = this.el.textContent;
                }

                var styles = _extends({}, this.overwrites, normalizeOptions(overwrites));

                var lineHeight = parseInt(prop(styles, 'line-height') || this.style.getPropertyValue('line-height'), 10);

                return this.lines(text, options, styles).length * lineHeight;
            }
        }, {
            key: 'lines',
            value: function lines(text) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var overwrites = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                if (!text && this.el) {
                    text = this.el.textContent;
                }

                var styles = _extends({}, this.overwrites, normalizeOptions(overwrites));
                var font = getFont(this.style, styles);

                // get max width
                var delimiter = prop(options, 'delimiter', ' ');
                var max = parseInt(prop(options, 'width') || prop(overwrites, 'width') || prop(this.el, 'offsetWidth', 0) || this.style.getPropertyValue('width'), 10);

                var letterSpacing = prop(styles, 'letter-spacing') || this.style.getPropertyValue('letter-spacing');
                var wordSpacing = prop(styles, 'word-spacing') || this.style.getPropertyValue('word-spacing');
                var addSpacing = addWordAndLetterSpacing(wordSpacing, letterSpacing);

                var styledText = getStyledText(text, this.style);
                var words = styledText.split(delimiter);

                if (text.length === 0 || words.length === 0) {
                    return 0;
                }

                var lines = [];
                var line = words.shift();

                var ctx = getContext2d(font);

                words.forEach(function (word, index) {
                    var width = ctx.measureText(line + delimiter + word).width + addSpacing(line + delimiter + word);

                    if (width <= max) {
                        line += delimiter + word;
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
        }, {
            key: 'maxFontSize',
            value: function maxFontSize(text) {
                var _this = this;

                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var overwrites = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                if (!text && this.el) {
                    text = this.el.textContent;
                }

                // simple compute function which adds the size and computes the with
                var compute = function compute(size) {
                    return _this.width(text, options, _extends({}, overwrites, { 'font-size': size + 'px' }));
                };

                // get max width
                var max = parseInt(prop(options, 'width') || prop(overwrites, 'width') || prop(this.el, 'offsetWidth', 0) || this.style.getPropertyValue('width'), 10);

                // start with half the max size
                var size = Math.floor(max / 2);
                var cur = compute(size);

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
        }]);

        return TextMetrics;
    }();

    exports.default = function (el, options) {
        return new TextMetrics(el, options);
    };

    module.exports = function (el, options) {
        return new TextMetrics(el, options);
    };
});