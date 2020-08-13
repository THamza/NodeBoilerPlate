"use strict";

const {ServiceError} = require("../service/service-error");

// Checks the fields of the JSON password recovery code verify request
let passwordRecoveryCodeVerify = (req, res, next) => {
  req.checkBody("recoveryToken")
    .exists().withMessage("recovery_token_required")
    .isString().withMessage("recovery_token_not_string")
    .notEmpty().withMessage("recovery_token_required");

  req.checkBody("recoveryCode")
    .exists().withMessage("recovery_code_required")
    .isString().withMessage("recovery_code_not_string")
    .notEmpty().withMessage("recovery_code_required");

  req.getValidationResult()
    .then(result => {
      if (!result.isEmpty())
        throw new ServiceError(result.array()[0].msg);

      next();
    })
    .catch(error => {
      ServiceError.handle(error, res, "passwordRecoveryCodeVerify");
    });
};

module.exports = passwordRecoveryCodeVerify;