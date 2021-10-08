class Exceptions extends Error {
  constructor(message, type, status) {
    super(message);
    this.message = message;
    this.detail = type;
    this.name = this.constructor.name;
    this.statusCode = status;
  }
}


const statusCodes = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  PAYMENT_REQUIRED: 402,
};

module.exports.Exceptions = Exceptions;
module.exports.statusCodes = statusCodes;
