(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'invariant'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('invariant'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.invariant);
        global.event = mod.exports;
    }
})(this, function (exports, _invariant) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _invariant2 = _interopRequireDefault(_invariant);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

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

    var eventTypeList = ['error', 'hmr', 'injectCallback', 'beforeCallback', 'beforeDispatch', 'afterDispatch', 'afterCallback'];

    var Event = function () {
        function Event() {
            var _this = this;

            _classCallCheck(this, Event);

            this.hooks = {};
            eventTypeList.forEach(function (event) {
                return _this.hooks[event] = [];
            });
        }

        _createClass(Event, [{
            key: 'on',
            value: function on(type, handler) {
                var hooks = this.hooks;
                (0, _invariant2.default)(hooks[type], 'shiner->on: unknown hook type: ' + type);
                var fns = hooks[type];
                fns.push(handler);
                return this.off.bind(this, type, handler);
            }
        }, {
            key: 'off',
            value: function off(type, handler) {
                this.hooks[type] = handler ? this.hooks[type].filter(function (fn) {
                    return fn !== handler;
                }) : [];
            }
        }, {
            key: 'trigger',
            value: function trigger(type, args) {
                var fns = this.hooks[type];
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = fns[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var fn = _step.value;

                        fn.apply(null, args);
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
            }
        }]);

        return Event;
    }();

    exports.default = Event;
});