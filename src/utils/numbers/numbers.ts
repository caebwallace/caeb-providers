/**
 * Round a string or a number to specified decimals.
 *
 * @exports helpers/numbers/roundTo
 * @param {number|string} n - The number to round to.
 * @param {number} decimals - The decimals to keep.
 * @returns {number} - The parsed number.
 * @example
 * roundTo('238.98', 2);
 */
export function roundTo(n: string | number, decimals = 2) {
    return nz(parseFloat(parseFloat((n || '').toString()).toFixed(decimals)), 0);
}

/**
 * Round a string or a number to specified decimals and returns a string.
 *
 * @exports helpers/numbers/roundToFixed
 * @param {number|string} n - The number to round to.
 * @param {number} decimals - The decimals to keep.
 * @returns {string} - The parsed number in string.
 * @example
 * roundToFixed('238.98', 2);
 */
export function roundToFixed(n: string | number, decimals = 2) {
    return roundTo(nz(parseFloat((n || '').toString()), 0), decimals).toFixed(decimals);
}

/**
 * Round a string or a number to specified decimals a ceiled.
 *
 * @exports utils/numbers/roundToCeil
 * @param {number|string} n - The number to round to.
 * @param {number} decimals - The decimals to keep.
 * @returns {number} - The parsed number.
 * @example
 * roundToCeil('238.98', 2);
 */
export function roundToCeil(n: number | string, decimals = 2) {
    const decimalsDivide = Math.pow(10, decimals);
    return nz(Math.ceil(parseFloat((n || '').toString()) * decimalsDivide) / decimalsDivide, 0);
}

/**
 * Round a string or a number to specified decimals a floored.
 *
 * @exports utils/numbers/roundToFloor
 * @param {number|string} n - The number to round to.
 * @param {number} decimals - The decimals to keep.
 * @returns {number} - The parsed number.
 * @example
 * roundToCeil('238.98', 2);
 */
export function roundToFloor(n: number | string, decimals = 2) {
    const decimalsDivide = Math.pow(10, decimals);
    return Math.floor(parseFloat(n.toString()) * decimalsDivide) / decimalsDivide;
}

/**
 * Calculate the variation in percents between two numbers.
 *
 * @exports helpers/numbers/getVariation
 * @param {number| string} past - The past value to compare.
 * @param {number| string} now - The actual value to compare.
 * @returns {number} - The variation.
 * @example
 * getVariation(1, 2);
 */
export function getVariation(past: number | string, now: number | string) {
    past = parseFloat(past.toString());
    now = parseFloat(now.toString());
    return ((now - past) * 100) / Math.abs(past);
}

/**
 * Non-Nan : Returns second number if first is NaN or undefined.
 *
 * @exports helpers/numbers/nz
 * @param {number} x - The number to test non NaN.
 * @param {number} y - The number to use if fails.
 * @returns {number} - The best of the two worlds.
 * @example
 * nz(NaN, 2); => 2
 */
export function nz(x: number, y: number) {
    return isNaN(x) || x === undefined ? y : x;
}

/**
 * Returns the count of decimals in a float.
 *
 * @exports helpers/numbers/countDecimals
 * @param {number} x - The input number.
 * @returns {number} - Count of decimals.
 */
export function countDecimals(x: number) {
    if (Math.floor(x) === x) return 0;
    if (x.toString().indexOf('e-') > -1) {
        const [base, trail] = x.toString().split('e-');
        return nz(parseInt(trail, 10), 0);
    }
    return nz(x.toString().split('.')[1]?.length, 0);
}
