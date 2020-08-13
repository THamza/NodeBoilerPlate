"use strict";

const {ServiceError} = require("../service/service-error");

// Checks the fields of the JSON sign in request
let removeUserFromParticipantsOFEventVerify = (req, res, next) => {
    req.checkBody("hashedID")
        .exists().withMessage("hashedID_required")
        .isString().withMessage("hashedID_required_not_string");

    req.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) // if result.isEmpty() returns false
                throw new ServiceError(result.array()[0].msg);

            next();
        })
        .catch(error => {
            ServiceError.handle(error, res, "removeUserFromParticipantsOFEventVerify");
        });
};

module.exports = removeUserFromParticipantsOFEventVerify;