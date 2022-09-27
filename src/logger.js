const winston = require('winston');

const options = {
  console: {
    level: 'debug',
    json: false,
    handleExceptions: true,
    colorize: true,
  },
};

const logger = winston.createLogger({
  transports: [new winston.transports.Console(options.console)],
});

const logError = (message, datadogProperties) => {
  logger.error(`ERROR: ${message}`, datadogProperties);
};

const logInfo = (message, datadogProperties) => {
  logger.info(`INFO: ${message}`, datadogProperties);
};

const logApiSuccess = (message, response, event, datadogProperties) => {
  const url = new URL(process.env.SERVER_ENDPOINT_URL);
  logInfo(message, {
    type: 'api_success',
    http: {
      method: event?.requestContext?.httpMethod,
      status_code: response?.statusCode ?? 200,
      url: `${process.env.SERVER_ENDPOINT_URL}${
        event?.requestContext?.path ?? '/'
      }`,
      url_details: {
        host: url.host,
        path: event?.requestContext?.path ?? '/',
        scheme: url.protocol?.replace(':', ''),
        queryString: {
          ...event.multiValueQueryStringParameters,
          ...event.queryStringParameters,
        },
      },
    },
    status: 'OK',
    ...datadogProperties,
  });
};

const logApiError = (message, event, error, datadogProperties) => {
  const url = new URL(process.env.SERVER_ENDPOINT_URL);
  logger.info(message, {
    type: 'api_failure',
    http: {
      method: event.requestContext.httpMethod,
      status_code: error?.statusCode ?? 500,
      url_details: {
        host: url.host,
        path: event.requestContext.path,
        scheme: url.protocol?.replace(':', ''),
        queryString: {
          ...event.multiValueQueryStringParameters,
          ...event.queryStringParameters,
        },
      },
    },
    ...datadogProperties,
  });
};

module.exports = {
  apiSuccess: logApiSuccess,
  apiError: logApiError,
  error: logError,
  info: logInfo,
};
