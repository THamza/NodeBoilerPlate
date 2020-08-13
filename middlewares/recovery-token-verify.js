"use strict";

const {UserToken} = require("../database/models/user-token");
const {ERROR_VALUE, ServiceError} = require("../service/service-error");

// Checks the validity of the recovery token
let recoveryTokenVerify = (req, res, next) => {
  // Check recovery token
  UserToken.findByValue(req.body.recoveryToken)
    .then(recoveryToken => {
      // Expired token
      if (!recoveryToken)
        throw new ServiceError(ERROR_VALUE.account_password_recovery_expired);

      // Invalid token
      if (recoveryToken === -1)
        throw new ServiceError(ERROR_VALUE.account_password_recovery_invalid);

      req.recoveryToken = recoveryToken;
      req.user = recoveryToken.user_id;
      next();
    })
    .catch(error => {
      ServiceError.handle(error, res, "recoveryTokenVerify");
    });
};

module.exports = recoveryTokenVerify;