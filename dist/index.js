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

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
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
        getText = _require.getText,
        getStyledText = _require.getStyledText,
        prepareText = _require.prepareText,
        getContext2d = _require.getContext2d,
        computeLinesDefault = _require.computeLinesDefault,
        computeLinesBreakAll = _require.computeLinesBreakAll,
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

                if ((typeof text === 'undefined' ? 'undefined' : _typeof(text)) === 'object' && text) {
                    overwrites = options;
                    options = text || {};
                    text = undefined;
                }

                if (!text && this.el) {
                    text = this.el.textContent.trim();
                } else {
                    text = prepareText(text);
                }

                var styledText = getStyledText(text, this.style);

                var styles = _extends({}, this.overwrites, normalizeOptions(overwrites));
                var font = getFont(this.style, styles);

                var letterSpacing = prop(styles, 'letter-spacing') || this.style.getPropertyValue('letter-spacing');
                var wordSpacing = prop(styles, 'word-spacing') || this.style.getPropertyValue('word-spacing');
                var addSpacing = addWordAndLetterSpacing(wordSpacing, letterSpacing);

                var ctx = getContext2d(font);

                if (options.multiline) {
                    return this.lines(styledText, options, overwrites).reduce(function (res, text) {
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

                if ((typeof text === 'undefined' ? 'undefined' : _typeof(text)) === 'object' && text) {
                    overwrites = options;
                    options = text || {};
                    text = undefined;
                }

                if (!text && this.el) {
                    text = getText(this.el);
                } else {
                    text = prepareText(text);
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

                if ((typeof text === 'undefined' ? 'undefined' : _typeof(text)) === 'object' && text) {
                    overwrites = options;
                    options = text;
                    text = undefined;
                }

                if (!text && this.el) {
                    text = getText(this.el);
                } else {
                    text = prepareText(text);
                }

                var styles = _extends({}, this.overwrites, normalizeOptions(overwrites));
                var font = getFont(this.style, styles);

                // get max width
                var max = parseInt(prop(options, 'width') || prop(overwrites, 'width') || prop(this.el, 'offsetWidth', 0) || this.style.getPropertyValue('width'), 10);

                var wordBreak = prop(styles, 'word-break') || this.style.getPropertyValue('word-break');
                var letterSpacing = prop(styles, 'letter-spacing') || this.style.getPropertyValue('letter-spacing');
                var wordSpacing = prop(styles, 'word-spacing') || this.style.getPropertyValue('word-spacing');
                var ctx = getContext2d(font);
                text = getStyledText(text, this.style);

                // different scenario when break-word is allowed
                if (wordBreak === 'break-all') {
                    return computeLinesBreakAll({ ctx: ctx, text: text, max: max, wordSpacing: wordSpacing, letterSpacing: letterSpacing });
                }

                return computeLinesDefault({ ctx: ctx, text: text, max: max, wordSpacing: wordSpacing, letterSpacing: letterSpacing });
            }
        }, {
            key: 'maxFontSize',
            value: function maxFontSize(text) {
                var _this = this;

                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var overwrites = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                if ((typeof text === 'undefined' ? 'undefined' : _typeof(text)) === 'object' && text) {
                    overwrites = options;
                    options = text;
                    text = undefined;
                }

                if (!text && this.el) {
                    text = getText(this.el);
                } else {
                    text = prepareText(text);
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

    exports.default = function (el, overwrites) {
        return new TextMetrics(el, overwrites);
    };

    module.exports = function (el, overwrites) {
        return new TextMetrics(el, overwrites);
    };
});