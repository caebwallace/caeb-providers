import pino, { Logger } from 'pino';

export const createLogger = (name: string): Logger => {
    function logMethod(args: any, method: any) {
        if (args.length === 2) {
            args[0] = `${args[0]} %j`;
        }
        method.apply(this, args);
    }

    return pino({
        name,
        level: 'trace',
        hooks: { logMethod },
        prettyPrint: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
            // messageFormat: '\x1B[90m{msg}',
            singleLine: true,
        },
    });
};

export { Logger };
