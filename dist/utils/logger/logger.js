'use strict';
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
exports.createLogger = void 0;
const pino_1 = __importDefault(require('pino'));
const createLogger = name => {
    function logMethod(args, method) {
        if (args.length === 2) {
            args[0] = `${args[0]} %j`;
        }
        method.apply(this, args);
    }
    return pino_1.default({
        name,
        level: 'trace',
        hooks: { logMethod },
        prettyPrint: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
            singleLine: true,
        },
    });
};
exports.createLogger = createLogger;
