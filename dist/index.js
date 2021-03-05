(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', 'lodash', 'lodash-es/noop', 'lodash-es/isPlainObject', 'react', 'react-dom', 'redux', 'react-redux', './handleActions', 'invariant', 'global/window', 'global/document', './event'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('lodash'), require('lodash-es/noop'), require('lodash-es/isPlainObject'), require('react'), require('react-dom'), require('redux'), require('react-redux'), require('./handleActions'), require('invariant'), require('global/window'), require('global/document'), require('./event'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.lodash, global.noop, global.isPlainObject, global.react, global.reactDom, global.redux, global.reactRedux, global.handleActions, global.invariant, global.window, global.document, global.event);
        global.index = mod.exports;
    }
})(this, function (exports, _lodash, _noop, _isPlainObject, _react, _reactDom, _redux, _reactRedux, _handleActions, _invariant, _window, _document, _event) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    exports.default = function () {
        var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var _opts$initialReducer = opts.initialReducer,
            initialReducer = _opts$initialReducer === undefined ? {} : _opts$initialReducer,
            _opts$initialState = opts.initialState,
            initialState = _opts$initialState === undefined ? {} : _opts$initialState,
            _opts$extraMiddleware = opts.extraMiddlewares,
            extraMiddlewares = _opts$extraMiddleware === undefined ? [] : _opts$extraMiddleware,
            _opts$extraEnhancers = opts.extraEnhancers,
            extraEnhancers = _opts$extraEnhancers === undefined ? [] : _opts$extraEnhancers;


        var event = new _event2.default();

        // error wrapper
        event.on('error', function (err) {
            throw new Error(err.stack || err);
        });

        var app = {
            // private properties
            _models: [],
            _store: null,
            _event: event,
            // methods
            model: model,
            start: start,
            connect: connect,
            getProvider: null
        };
        return app;

        ////////////////////////////////////
        // Methods

        /**
         * Register a model.
         *
         * @param model
         */
        function model(model) {
            var _this = this;

            if (_lodash2.default.isArray(model)) {
                _lodash2.default.forEach(model, function (item) {
                    _this._models.push(checkModel(item));
                });
            } else this._models.push(checkModel(model));
        }

        // inject model dynamically
        function injectModel(createReducer, m) {
            if (m.namespace) {
                var hasExisted = this._models.some(function (model) {
                    return model.namespace === m.namespace;
                });
                if (hasExisted) {
                    return;
                }
            }
            m = checkModel(m);
            this._models.push(m);
            var store = this._store;

            // reducers
            store.additionalReducers[m.namespace] = getReducer(m.reducers, m.state);
            store.replaceReducer(createReducer(store.additionalReducers));
        }

        /**
         * Start the application. Selector is optional. If no selector
         * arguments, it will return a function that return JSX elements.
         *
         * @param container selector | HTMLElement
         * @param RootComponent Component
         * @param onRendered rendered callback
         */
        function start(container, RootComponent, onRendered) {
            var _this2 = this;

            // support selector
            if (typeof container === 'string') {
                container = _document2.default.querySelector(container);
                (0, _invariant2.default)(container, 'shiner->start: could not query selector: ' + container);
            }

            (0, _invariant2.default)(!container || isHTMLElement(container), 'shiner->start: container should be HTMLElement');

            var reducers = _extends({}, initialReducer);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this._models[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var m = _step.value;

                    reducers[m.namespace] = getReducer(m.reducers, m.state);
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

            var devTools = function devTools() {
                return function (noop) {
                    return noop;
                };
            };
            if (process.env.NODE_ENV !== 'production' && _window2.default.__REDUX_DEVTOOLS_EXTENSION__) {
                devTools = _window2.default.__REDUX_DEVTOOLS_EXTENSION__;
            }
            var enhancers = [_redux.applyMiddleware.apply(undefined, _toConsumableArray(extraMiddlewares)), devTools()].concat(_toConsumableArray(extraEnhancers));
            var store = this._store = (0, _redux.createStore)(createReducer(), initialState, _redux.compose.apply(undefined, _toConsumableArray(enhancers)));

            function createReducer() {
                var additionalReducers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                return (0, _redux.combineReducers)(_extends({}, reducers, additionalReducers));
            }

            store.additionalReducers = {};

            // inject model after start
            this.model = injectModel.bind(this, createReducer);

            this.getProvider = getProvider.bind(this);

            // If has container, render; else, return react component
            if (container) {
                render.call(this, container, RootComponent, onRendered);
                event.on('hmr', function (Component) {
                    return render.call(_this2, container, Component, onRendered);
                });
            } else {
                return getProvider(RootComponent);
            }
        }

        function buildHandler(handler, key) {
            var context = {
                traceId: 'trace-callback-' + (Math.random() + '').replace('0.', '') + '-' + key,
                callback: key
            };
            var dispatch = function dispatch(action) {
                action.meta = _extends({
                    _traceId: context.traceId,
                    _callback: context.callback
                }, action.meta || {});
                event.trigger('beforeDispatch', [_extends({ action: action }, context), dispatch]);
                app._store.dispatch(action);
                event.trigger('afterDispatch', [_extends({ action: action }, context), dispatch]);
            };
            dispatch.trace = context;

            return function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                var triggerError = function triggerError(err) {
                    return event.trigger('error', [_extends({ error: err }, context), dispatch]);
                };

                try {
                    event.trigger('beforeCallback', [context, dispatch]);

                    var ret = handler.call.apply(handler, [null, {
                        getState: app._store.getState,
                        dispatch: dispatch
                    }].concat(args));

                    if (ret instanceof Promise) {
                        ret.catch(function (err) {
                            triggerError(err);
                            event.trigger('afterCallback', [_extends({ result: ret }, context), dispatch]);
                            return Promise.reject(err);
                        });
                    } else {
                        event.trigger('afterCallback', [_extends({ result: ret }, context), dispatch]);
                    }

                    return ret;
                } catch (err) {
                    triggerError(err);
                }
            };
        }

        // 使用react-redux-hk来优化性能
        function connect(getUIState, callbacks, mergeProps) {
            var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

            (0, _invariant2.default)(typeof getUIState === 'undefined' || typeof getUIState === 'function', 'shiner->connect: getUIState should be function');
            var mapStateToProps = getUIState;
            var mapDispatchToProps = !callbacks ? undefined : function () {
                if (!callbacks.initializedCallbacks) {
                    (0, _invariant2.default)((0, _isPlainObject2.default)(callbacks), 'shiner->connect: callbacks should be plain object');
                    var initializedCallbacks = {};
                    Object.keys(callbacks).map(function (key) {
                        (0, _invariant2.default)(typeof callbacks[key] === 'function', 'shiner->connect: callbacks\'s each item should be function, but found ' + key);
                        event.trigger('injectCallback', [key, callbacks[key]]);
                        initializedCallbacks[key] = buildHandler(callbacks[key], key);
                    });
                    callbacks.initializedCallbacks = initializedCallbacks;
                }
                return callbacks.initializedCallbacks;
            };
            return function (UI) {
                return (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps, mergeProps, options)(UI);
            };
        }

        ////////////////////////////////////
        // Helpers
        function getProvider(RootComponent) {
            var store = app._store;
            return function () {
                return _react2.default.createElement(
                    _reactRedux.Provider,
                    { store: store },
                    RootComponent
                );
            };
        }

        function render(container, RootComponent) {
            var cb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _noop2.default;

            _reactDom2.default.render(_react2.default.createElement(getProvider(RootComponent)), container, cb.bind(null, app._store));
        }

        function checkModel(m) {
            // Clone model to avoid prefixing namespace multiple times
            var model = _extends({}, m);
            var namespace = model.namespace,
                reducers = model.reducers;


            (0, _invariant2.default)(namespace, 'shiner->model: namespace should be defined');
            (0, _invariant2.default)(!reducers || (0, _isPlainObject2.default)(reducers) || Array.isArray(reducers), 'shiner->model: reducers should be plain object or array');
            (0, _invariant2.default)(!Array.isArray(reducers) || (0, _isPlainObject2.default)(reducers[0]) && typeof reducers[1] === 'function', 'shiner->model: reducers with array should be app.model({ reducers: [object, function] })');
            (0, _invariant2.default)(!app._models.some(function (model) {
                return model.namespace === namespace;
            }), 'app.model: namespace should be unique');

            function getNamespacedReducers(reducers) {
                return Object.keys(reducers).reduce(function (memo, key) {
                    (0, _invariant2.default)(key.indexOf('' + namespace + SEP) !== 0, 'shiner->model: reducer ' + key + ' should not be prefixed with namespace ' + namespace);
                    memo['' + namespace + SEP + key] = reducers[key];
                    return memo;
                }, {});
            }

            if (model.reducers) {
                if (Array.isArray(model.reducers)) {
                    model.reducers[0] = getNamespacedReducers(model.reducers[0]);
                } else {
                    model.reducers = getNamespacedReducers(model.reducers);
                }
            }

            return model;
        }

        function isHTMLElement(node) {
            return (typeof node === 'undefined' ? 'undefined' : _typeof(node)) === 'object' && node !== null && node.nodeType && node.nodeName;
        }

        function getReducer(reducers, state) {
            if (Array.isArray(reducers)) {
                return reducers[1]((0, _handleActions2.default)(reducers[0], state));
            } else {
                return (0, _handleActions2.default)(reducers || {}, state);
            }
        }
    };

    var _lodash2 = _interopRequireDefault(_lodash);

    var _noop2 = _interopRequireDefault(_noop);

    var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

    var _react2 = _interopRequireDefault(_react);

    var _reactDom2 = _interopRequireDefault(_reactDom);

    var _handleActions2 = _interopRequireDefault(_handleActions);

    var _invariant2 = _interopRequireDefault(_invariant);

    var _window2 = _interopRequireDefault(_window);

    var _document2 = _interopRequireDefault(_document);

    var _event2 = _interopRequireDefault(_event);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
    } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

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

    var SEP = '/';

    ;
});