"use strict";

const {ServiceError} = require("../service/service-error");


// Checks the fields of the JSON sign up request
let getUsersDataVerify = (req, res, next) => {
    req.checkBody("IDs")
        .exists().withMessage("IDs_required");


    req.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) // if result.isEmpty() returns false
                throw new ServiceError(result.array()[0].msg);

            next();
        })
        .catch(error => {
            ServiceError.handle(error, res, "getUsersDataVerify");
        });
};

module.exports = getUsersDataVerify;