"use strict";

const {ServiceError} = require("../service/service-error");

// Checks the fields of the JSON password recovery request
let passwordRecoveryVerify = (req, res, next) => {
  req.checkBody("email")
    .exists().withMessage("email_required")
    .isString().withMessage("email_not_string")
    .notEmpty().withMessage("email_required");

  req.getValidationResult()
    .then(result => {
      if (!result.isEmpty())
        throw new ServiceError(result.array()[0].msg);

      next();
    })
    .catch(error => {
      ServiceError.handle(error, res, "passwordRecoveryVerify");
    });
};

module.exports = passwordRecoveryVerify;