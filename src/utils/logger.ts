import pino, { LogFn, Logger } from 'pino';

function logMethod(this: Logger, args: Parameters<LogFn>, method: LogFn) {
  if (args.length === 2) {
    args[0] = `${args[0]} %j`;
  }
  method.apply(this, args);
}

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  hooks: { logMethod },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

export default logger;
