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

    function _toConsumableArray(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
                arr2[i] = arr[i];
            }

            return arr2;
        } else {
            return Array.from(arr);
        }
    }

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
        prepareText = _require.prepareText,
        getContext2d = _require.getContext2d,
        normalizeOptions = _require.normalizeOptions,
        checkBreak = _require.checkBreak,
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

                if (!text && this.el) {
                    text = this.el.textContent.trim();
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

                if (!text && this.el) {
                    text = this.el.textContent.trim();
                } else {
                    text = prepareText(text);
                }

                var styles = _extends({}, this.overwrites, normalizeOptions(overwrites));
                var font = getFont(this.style, styles);

                // get max width
                var delimiter = prop(options, 'delimiter', /[\u0020,\u1680,\u2000,\u2001,\u2002,\u2003,\u2004,\u2005,\u2006,\u2008,\u2009,\u200A,\u205F,\u3000]/);
                var max = parseInt(prop(options, 'width') || prop(overwrites, 'width') || prop(this.el, 'offsetWidth', 0) || this.style.getPropertyValue('width'), 10);

                var breakWord = prop(styles, 'word-break') === 'break-all';

                var letterSpacing = prop(styles, 'letter-spacing') || this.style.getPropertyValue('letter-spacing');
                var wordSpacing = prop(styles, 'word-spacing') || this.style.getPropertyValue('word-spacing');
                var addSpacing = addWordAndLetterSpacing(wordSpacing, letterSpacing);

                var styledText = getStyledText(text, this.style);
                var words = styledText.split(delimiter);

                if (text.length === 0 || words.length === 0) {
                    return 0;
                }

                var ctx = getContext2d(font);
                var lines = [];

                var line = '';

                // different scenario when break-word is allowed
                if (breakWord) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = styledText[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var chr = _step.value;

                            // measure width
                            var width = ctx.measureText(line + chr).width + addSpacing(line + chr);

                            // needs at least one character
                            if (width > max && [].concat(_toConsumableArray(line)).length !== 0) {
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
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                } else {
                    // last possible break
                    var lpb = void 0;
                    var index = 0;

                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = styledText[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var _chr = _step2.value;

                            // measure width
                            var _width = ctx.measureText(line + _chr).width + addSpacing(line + _chr);
                            var type = checkBreak(_chr);

                            // use es2015 array to count code points properly
                            // https://mathiasbynens.be/notes/javascript-unicode
                            var lineArray = [].concat(_toConsumableArray(line));

                            if (type && lineArray.length !== 0) {
                                lpb = { type: type, index: index, chr: _chr };
                            }

                            // needs at least one character
                            if (_width > max && lineArray.length !== 0 && lpb) {
                                var nl = lineArray.slice(0, lpb.index).join('');
                                // the break character is handled in the switch statement below
                                if (lpb.index === index) {
                                    line = '';
                                } else {
                                    line = lineArray.slice(lpb.index + 1).join('') + _chr;
                                }
                                index = [].concat(_toConsumableArray(line)).length;
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
                                if (_chr !== '\xAD') {
                                    line += _chr;
                                }
                                index++;
                            }
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }
                }

                if ([].concat(_toConsumableArray(line)).length !== 0) {
                    lines.push(line);
                }

                console.log(lines);
                return lines;
            }
        }, {
            key: 'maxFontSize',
            value: function maxFontSize(text) {
                var _this = this;

                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var overwrites = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                if (!text && this.el) {
                    text = this.el.textContent.trim();
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