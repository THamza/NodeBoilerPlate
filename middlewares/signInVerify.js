"use strict";

const {ServiceError} = require("../service/service-error");

// Checks the fields of the JSON sign in request
let signInVerify = (req, res, next) => {
    req.checkBody("identity")
        .exists().withMessage("identity_required")
        .isString().withMessage("identity_not_string")
        .notEmpty().withMessage("identity_required");

    req.checkBody("password")
        .exists().withMessage("password_required")
        .isString().withMessage("password_not_string")
        .notEmpty().withMessage("password_required");

    req.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) // if result.isEmpty() returns false
                throw new ServiceError(result.array()[0].msg);

            next();
        })
        .catch(error => {
            ServiceError.handle(error, res, "signInVerify");
        });
};

module.exports = signInVerify;