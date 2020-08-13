"use strict";

const {ServiceError} = require("../service/service-error");

// Checks the fields of the JSON password recovery resend request
let passwordRecoveryResendVerify = (req, res, next) => {
  req.checkBody("recoveryToken")
    .exists().withMessage("recovery_token_required")
    .isString().withMessage("recovery_token_not_string")
    .notEmpty().withMessage("recovery_token_required");

  req.getValidationResult()
    .then(result => {
      if (!result.isEmpty())
        throw new ServiceError(result.array()[0].msg);

      next();
    })
    .catch(error => {
      ServiceError.handle(error, res, "passwordRecoveryResendVerify");
    });
};

module.exports = passwordRecoveryResendVerify;