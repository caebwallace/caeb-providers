'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.countDecimals = exports.nz = exports.getVariation = exports.roundToFloor = exports.roundToCeil = exports.roundToFixed = exports.roundTo = void 0;
function roundTo(n, decimals = 2) {
    return nz(parseFloat(parseFloat((n || '').toString()).toFixed(decimals)), 0);
}
exports.roundTo = roundTo;
function roundToFixed(n, decimals = 2) {
    return roundTo(nz(parseFloat((n || '').toString()), 0), decimals).toFixed(decimals);
}
exports.roundToFixed = roundToFixed;
function roundToCeil(n, decimals = 2) {
    const decimalsDivide = Math.pow(10, decimals);
    return nz(Math.ceil(parseFloat((n || '').toString()) * decimalsDivide) / decimalsDivide, 0);
}
exports.roundToCeil = roundToCeil;
function roundToFloor(n, decimals = 2) {
    const decimalsDivide = Math.pow(10, decimals);
    return Math.floor(parseFloat(n.toString()) * decimalsDivide) / decimalsDivide;
}
exports.roundToFloor = roundToFloor;
function getVariation(past, now) {
    past = parseFloat(past.toString());
    now = parseFloat(now.toString());
    return ((now - past) * 100) / Math.abs(past);
}
exports.getVariation = getVariation;
function nz(x, y) {
    return isNaN(x) || x === undefined ? y : x;
}
exports.nz = nz;
function countDecimals(x) {
    var _a;
    if (Math.floor(x) === x) return 0;
    if (x.toString().indexOf('e-') > -1) {
        const [base, trail] = x.toString().split('e-');
        return nz(parseInt(trail, 10), 0);
    }
    return nz((_a = x.toString().split('.')[1]) === null || _a === void 0 ? void 0 : _a.length, 0);
}
exports.countDecimals = countDecimals;
