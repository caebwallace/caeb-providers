'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatBalances = void 0;
const numbers_1 = require('../../../../utils/numbers/numbers');
const formatBalances = (rawBalances, hideSmallBalances = false) => {
    const balances = [];
    rawBalances.forEach(b => {
        const balance = balances.find(n => n.asset === b.coin);
        if (balance) {
            balance.free += (0, numbers_1.nz)(b.free, 0);
            balance.locked += (0, numbers_1.nz)(b.total - b.free, 0);
        } else {
            balances.push({
                asset: b.coin,
                free: (0, numbers_1.nz)(b.free, 0),
                locked: (0, numbers_1.nz)(b.total - b.free, 0),
            });
        }
    });
    return hideSmallBalances ? balances.filter(a => a.free || a.locked) : balances;
};
exports.formatBalances = formatBalances;
