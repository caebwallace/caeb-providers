/**
 * Floor a datetime with a windowInterval.
 *
 * @exports utils/date/floorCandleDate
 * @param {Date} date - The date to floor.
 * @param {number} windowInterval - Window interval in ms.
 * @returns {number} - The floored date.
 * @example
 * floorCandleDate(moment('2020-10-07T17:42:15+02:00'), moment.duration('PT4H').valueOf());
 */
export function floorCandleDate(date: number, windowInterval: number): number {
    return date - (date % windowInterval) + 1;
}

/**
 * Ceil a datetime with a windowInterval.
 *
 * @exports helpers/date/ceilCandleDate
 * @param {Date} date - The date to ceil.
 * @param {number} windowInterval - Window interval in ms.
 * @returns {number} - The floored date.
 * @example
 * ceilCandleDate(moment('2020-10-07T17:42:15+02:00'), moment.duration('PT4H').valueOf());
 */
export function ceilCandleDate(date: number, windowInterval: number): number {
    return date + (windowInterval - (date % windowInterval));
}
