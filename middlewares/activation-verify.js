"use strict";

const {ServiceError} = require("../service/service-error");

// Checks the fields of the JSON activation request
let activationVerify = (req, res, next) => {
  req.checkBody("activationToken")
    .exists().withMessage("activation_token_required")
    .isString().withMessage("activation_token_not_string")
    .notEmpty().withMessage("activation_token_required");

  req.checkBody("activationCode")
    .exists().withMessage("activation_code_required")
    .isString().withMessage("activation_code_not_string")
    .notEmpty().withMessage("activation_code_required");

  req.getValidationResult()
    .then(result => {
      if (!result.isEmpty())
        throw new ServiceError(result.array()[0].msg);

      next();
    })
    .catch(error => {
      ServiceError.handle(error, res, "activationVerify");
    });
};

module.exports = activationVerify;