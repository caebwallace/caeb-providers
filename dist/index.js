'use strict';
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                      return m[k];
                  },
              });
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
          });
var __exportStar =
    (this && this.__exportStar) ||
    function (m, exports) {
        for (var p in m) if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
    };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ProviderFtx = exports.ProviderKucoin = exports.ProviderBinance = void 0;
var lib_1 = require('./clients/binance/lib');
Object.defineProperty(exports, 'ProviderBinance', {
    enumerable: true,
    get: function () {
        return lib_1.ProviderBinance;
    },
});
var lib_2 = require('./clients/kucoin/lib');
Object.defineProperty(exports, 'ProviderKucoin', {
    enumerable: true,
    get: function () {
        return lib_2.ProviderKucoin;
    },
});
var lib_3 = require('./clients/ftx/lib');
Object.defineProperty(exports, 'ProviderFtx', {
    enumerable: true,
    get: function () {
        return lib_3.ProviderFtx;
    },
});
__exportStar(require('./clients/common/interfaces'), exports);
__exportStar(require('./utils/errors'), exports);
