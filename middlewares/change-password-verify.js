"use strict";

const {ServiceError} = require("../service/service-error");

// Checks the fields of the JSON change password request
let changePasswordVerify = (req, res, next) => {
  req.checkBody("currentPassword")
    .exists().withMessage("password_current_required")
    .isString().withMessage("password_current_not_string")
    .notEmpty().withMessage("password_current_required");

  req.checkBody("newPassword")
    .exists().withMessage("password_new_required")
    .isString().withMessage("password_new_not_string")
    .notEmpty().withMessage("password_new_required")
    .isLength({min: 8}).withMessage("password_new_length");

  req.checkBody("confirmPassword")
    .exists().withMessage("password_confirm_required")
    .isString().withMessage("password_confirm_not_string")
    .equals(req.body.newPassword).withMessage("password_mismatch");

  req.getValidationResult()
    .then(result => {
      if (!result.isEmpty())
        throw new ServiceError(result.array()[0].msg);

      next();
    })
    .catch(error => {
      ServiceError.handle(error, res, "changePasswordVerify");
    });
};

// Checks the fields of the JSON change password recovery request
let changePasswordRecoveryVerify = (req, res, next) => {
  req.checkBody("recoveryToken")
    .exists().withMessage("recovery_token_required")
    .isString().withMessage("recovery_token_not_string")
    .notEmpty().withMessage("recovery_token_required");

  req.checkBody("recoveryCode")
    .exists().withMessage("recovery_code_required")
    .isString().withMessage("recovery_code_not_string")
    .notEmpty().withMessage("recovery_code_required");

  req.checkBody("password")
    .exists().withMessage("password_required")
    .isString().withMessage("password_not_string")
    .notEmpty().withMessage("password_required")
    .isLength({min: 8}).withMessage("password_length");

  req.checkBody("confirmPassword")
    .exists().withMessage("password_confirm_required")
    .isString().withMessage("password_confirm_not_string")
    .equals(req.body.password).withMessage("password_mismatch");

  req.getValidationResult()
    .then(result => {
      if (!result.isEmpty())
        throw new ServiceError(result.array()[0].msg);

      next();
    })
    .catch(error => {
      ServiceError.handle(error, res, "changePasswordRecoveryVerify");
    });
};

module.exports = {
  changePasswordVerify,
  changePasswordRecoveryVerify
};