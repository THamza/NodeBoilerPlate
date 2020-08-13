"use strict";

const {ServiceError} = require("../service/service-error");

// Checks the fields of the JSON activation resend request
let activationResendVerify = (req, res, next) => {
  req.checkBody("activationToken")
    .exists().withMessage("activation_token_required")
    .isString().withMessage("activation_token_not_string")
    .notEmpty().withMessage("activation_token_required");

  req.getValidationResult()
    .then(result => {
      if (!result.isEmpty())
        throw new ServiceError(result.array()[0].msg);

      next();
    })
    .catch(error => {
      ServiceError.handle(error, res, "activationResendVerify");
    });
};

module.exports = activationResendVerify;