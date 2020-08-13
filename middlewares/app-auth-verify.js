"use strict";

const {UserToken} = require("../database/models/user-token");
const {ERROR_VALUE, ServiceError} = require("../service/service-error");

// Checks if app authentication header is valid
let appAuthVerify = (req, res, next) => {
  // Check if app token exists
  UserToken.findByValue(req.header("auth"))
    .then(appToken => {
      if (!appToken)
        throw new ServiceError(ERROR_VALUE.app_token_invalid);

      req.appToken = appToken;
      req.user = appToken.user_id;
      next();
    })
    .catch(error => {
      ServiceError.handle(error, res, "appAuthVerify");
    });
};

module.exports = appAuthVerify;