(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.handleActions = mod.exports;
    }
})(this, function (exports) {
    "use strict";

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

    function handleAction(actionType) {
        var reducer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (state) {
            return state;
        };

        return function (state, action) {
            if (action.type && actionType !== action.type) {
                return state;
            }
            return reducer(state, action);
        };
    }

    function reduceReducers() {
        for (var _len = arguments.length, reducers = Array(_len), _key = 0; _key < _len; _key++) {
            reducers[_key] = arguments[_key];
        }

        return function (previous, current) {
            return reducers.reduce(function (p, r) {
                return r(p, current);
            }, previous);
        };
    }

    function handleActions(handlers, defaultState) {
        var reducers = Object.keys(handlers).map(function (type) {
            return handleAction(type, handlers[type]);
        });
        var reducer = reduceReducers.apply(undefined, _toConsumableArray(reducers));
        return function () {
            var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState;
            var action = arguments[1];
            return reducer(state, action);
        };
    }

    exports.default = handleActions;
});