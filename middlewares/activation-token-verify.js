"use strict";

const {UserToken} = require("../database/models/user-token");
const {ERROR_VALUE, ServiceError} = require("../service/service-error");

// Checks the validity of the recovery token
let activationTokenVerify = (req, res, next) => {
  // Check activation token
  UserToken.findByValue(req.body.activationToken)
    .then(activationToken => {
      // Expired token
      if (!activationToken)
        throw new ServiceError(ERROR_VALUE.account_activation_expired);

      // Invalid token
      if (activationToken === -1)
        throw new ServiceError(ERROR_VALUE.account_activation_invalid);

      // Account already activated
      if (activationToken.user_id.isActivated)
        throw new ServiceError(ERROR_VALUE.account_activation_exists);

      req.activationToken = activationToken;
      req.user = activationToken.user_id;
      next();
    })
    .catch(error => {
      ServiceError.handle(error, res, "activationTokenVerify");
    });
};

module.exports = activationTokenVerify;