'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.OrderType = exports.OrderSide = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus['CANCELED'] = 'CANCELED';
    OrderStatus['EXPIRED'] = 'EXPIRED';
    OrderStatus['FILLED'] = 'FILLED';
    OrderStatus['NEW'] = 'NEW';
    OrderStatus['PARTIALLY_FILLED'] = 'PARTIALLY_FILLED';
    OrderStatus['PENDING_CANCEL'] = 'PENDING_CANCEL';
    OrderStatus['REJECTED'] = 'REJECTED';
})((OrderStatus = exports.OrderStatus || (exports.OrderStatus = {})));
var OrderSide;
(function (OrderSide) {
    OrderSide['BUY'] = 'BUY';
    OrderSide['SELL'] = 'SELL';
})((OrderSide = exports.OrderSide || (exports.OrderSide = {})));
var OrderType;
(function (OrderType) {
    OrderType['LIMIT'] = 'LIMIT';
    OrderType['LIMIT_MAKER'] = 'LIMIT_MAKER';
    OrderType['MARKET'] = 'MARKET';
    OrderType['STOP'] = 'STOP';
    OrderType['STOP_LOSS_LIMIT'] = 'STOP_LOSS_LIMIT';
    OrderType['STOP_MARKET'] = 'STOP_MARKET';
    OrderType['TAKE_PROFIT_MARKET'] = 'TAKE_PROFIT_MARKET';
    OrderType['TAKE_PROFIT_LIMIT'] = 'TAKE_PROFIT_LIMIT';
    OrderType['TRAILING_STOP_MARKET'] = 'TRAILING_STOP_MARKET';
    OrderType['TAKE_PROFIT'] = 'TAKE_PROFIT';
})((OrderType = exports.OrderType || (exports.OrderType = {})));
