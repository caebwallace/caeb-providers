'use strict';
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              var desc = Object.getOwnPropertyDescriptor(m, k);
              if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                  desc = {
                      enumerable: true,
                      get: function () {
                          return m[k];
                      },
                  };
              }
              Object.defineProperty(o, k2, desc);
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
const lib_1 = require('./clients/binance/lib');
Object.defineProperty(exports, 'ProviderBinance', {
    enumerable: true,
    get: function () {
        return lib_1.ProviderBinance;
    },
});
const lib_2 = require('./clients/ftx/lib');
Object.defineProperty(exports, 'ProviderFtx', {
    enumerable: true,
    get: function () {
        return lib_2.ProviderFtx;
    },
});
const lib_3 = require('./clients/kucoin/lib');
Object.defineProperty(exports, 'ProviderKucoin', {
    enumerable: true,
    get: function () {
        return lib_3.ProviderKucoin;
    },
});
__exportStar(require('./clients/common/interfaces'), exports);
__exportStar(require('./utils/errors'), exports);
