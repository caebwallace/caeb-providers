'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatBalances = void 0;
const numbers_1 = require('../../../../utils/numbers/numbers');
const formatBalances = (rawBalances, hideSmallBalances = false) => {
    const balances = rawBalances.map(b => {
        return {
            asset: b.asset,
            free: numbers_1.nz(parseFloat(b.free), 0),
            locked: numbers_1.nz(parseFloat(b.locked), 0),
        };
    });
    return hideSmallBalances ? balances.filter(a => a.free || a.locked) : balances;
};
exports.formatBalances = formatBalances;
