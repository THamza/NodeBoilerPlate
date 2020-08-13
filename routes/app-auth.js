"use strict"

var signUpVerify = require("../middlewares/signUpVerify");
const signInVerify = require("../middlewares/signInVerify");
const activationResendVerify = require("../middlewares/activation-resend-verify");
const activationTokenVerify = require("../middlewares/activation-token-verify");
const activationVerify = require("../middlewares/activation-verify");
const {ERROR_VALUE, ServiceError} = require("../service/service-error");
const {AccessType, UserToken} = require("../database/models/user-token");
const {SUCCESS_VALUE, ServiceSuccess} = require("../service/service-success");
const Promise = require("bluebird");
const bcrypt = Promise.promisifyAll(require("bcryptjs"));
const User = require("../database/models/user");
const {Log, LogType} = require("../database/models/log");
const JsonResponse = require("../utils/json-response");
const Mailer = require("../mailer/mailer");
const appAuthVerify = require("../middlewares/app-auth-verify");
const passwordRecoveryVerify = require("../middlewares/password-recovery-verify");
const passwordRecoveryResendVerify = require("../middlewares/password-recovery-resend-verify");
const recoveryTokenVerify = require("../middlewares/recovery-token-verify");
const passwordRecoveryCodeVerify = require("../middlewares/password-recovery-code-verify");
const {changePasswordRecoveryVerify} = require("../middlewares/change-password-verify");

const express = require('express');

const router = express.Router();

const SALT_ROUNDS = 12;

/**
 * Test
 */
router.get("/", (req, res) => {
    res.json(JsonResponse.success(new ServiceSuccess(SUCCESS_VALUE.connection_established)));
});


/**
 * Sign up a user. This is a post request that creates a new user in the database.
 */
router.post("/signup", signUpVerify, (req, res) => {
    let theActivationTokken;

    // Check if aui ID is already in use
    User.findByEmail(req.body.email)
        .then(user => {
            if (user)
                throw new ServiceError(ERROR_VALUE.account_email_exists);

            //Check if phoneNumber is already in use
            return User.findByPhoneNumber(req.body.phoneNumber);
        }).then (user => {

            if (user)
                 throw new ServiceError(ERROR_VALUE.account_phoneNumber_exists);
            // Get user IP address
            // let ipAddress = req.headers["x-remote-ip"];
        // var code = QRCode(email,{
        //     size: 250
        // });opio
        // Create new user account in database
        return User.createNew(req.body.firstName, req.body.lastName, req.body.username, req.body.email , req.body.password, req.body.phoneNumber,
             req.body.gender);

        })
        .then(user => {
            // Get activation token details
            return UserToken.get(AccessType.ACTIVATION, user._id, true);
        })
        .then(activationToken => {
            theActivationTokken = activationToken;
            // Send activation mail
            Mailer.sendActivationMail(this.body.email, activationToken.payload);

            res.json(JsonResponse.success(new ServiceSuccess(SUCCESS_VALUE.account_signup_success), {
               activationToken: theActivationTokken.value
            }));
        })
        .catch(error => {
            ServiceError.handle(error, res, req.fullUrl);
        });
});


/**
 * Resends an activation email to a user. This deletes the existing activation email, creates
 * a new one and sends the new activation token to the user's email address.
 */
router.post("/activation/resend", activationResendVerify, activationTokenVerify, (req, res) => {
    // Delete existing activation token
    UserToken.delete(AccessType.ACTIVATION, req.user._id)
        .then(() => {
            // Generate new activation token
            return UserToken.generate(AccessType.ACTIVATION, req.user._id, null, true);
        })
        .then(activationToken => {
            // Resend activation mail
            Mailer.sendActivationMail(req.user.email, activationToken.payload);

            res.json(JsonResponse.success(new ServiceSuccess(SUCCESS_VALUE.account_activation_email_sent), {
                activationToken: activationToken.value
            }));
        })
        .catch(error => {
            ServiceError.handle(error, res, req.fullUrl);
        });
});

/**
 * Activates a user account
 */
router.post("/activation", activationVerify, activationTokenVerify, (req, res) => {
    Promise.resolve()
        .then(() => {
            // Check if activation code matches
            if (req.activationToken.payload !== req.body.activationCode)
                throw new ServiceError(ERROR_VALUE.activation_code_invalid);

            // Activate user account
            return req.user.activateAccount();
        })
        .then(() => {
            res.json(JsonResponse.success(new ServiceSuccess(SUCCESS_VALUE.account_activation_success)));
        })
        .catch(error => {
            ServiceError.handle(error, res, req.fullUrl);
        });
});

/**
 * Sign in a user. First checks to see if a user exists in the database. If so, it checks to see if the user's
 * account has been activated. If the account has been activated, a new App token is created, which the user
 * needs to access every page past sign-in in the application.
 * @type {Router|router|*}
 */

router.post("/signin", signInVerify, (req, res) => {
    // Check user credentials
    User.findByCredentials(req.body.identity, req.body.password)
        .then(user => {
            if (!user || user === -1)
                throw new ServiceError(ERROR_VALUE.account_signin_invalid);

            req.user = user;

            if (!user.isActivated) {
                throw new ServiceError(ERROR_VALUE.account_not_activated);
            }
            if (!user.isActivated) {
                // Retrieve activation token
                return UserToken.get(AccessType.ACTIVATION, user._id);
            } else {
                // Generate a new app token
                return UserToken.generate(AccessType.APP, user._id, null, true);
            }
        })
        .then(token => {
            let result = {};

            result.username = req.user.username;

            if (req.user.isActivated) {
                result.isActivated = true;
                result.appToken = token;
            } else {
                result.isActivated = false;
                result.activationToken = token;
            }
            result["hashedID"]= req.user.hashedID;

            res.json(JsonResponse.success(new ServiceSuccess(SUCCESS_VALUE.account_signin_success), result));
        })
        .catch(error => {
            Log.createNew(
                LogType.USER_SIGNIN_ERROR,
                `User tried to sign in with identity ${req.body.identity}`,
                req.fullUrl
            );

            ServiceError.handle(error, res, req.fullUrl);
        });
});

/**
 * Signs out a user. Removes the app token from the database.
 */
router.post("/signout", appAuthVerify, (req, res) => {
    // Remove app token from database
    req.appToken.remove()
        .then(() => {
            res.json(JsonResponse.success(new ServiceSuccess(SUCCESS_VALUE.account_signout_success)));
        })
        .catch(error => {
            ServiceError.handle(error, res, req.fullUrl);
        });
});

/**
 * Sends a password recovery email to a user FIRST STEP
 */
router.post("/password-recovery", passwordRecoveryVerify, (req, res) => {
// Check if user exists
    User.findByEmail(req.body.email)
        .then(user => {
            if (!user)
                throw new ServiceError(ERROR_VALUE.account_not_found);

            req.user = user;

            // Delete existing recovery token
            return UserToken.delete(AccessType.RECOVERY, user._id);
        })
        .then(() => {
            // Generate new recovery token
            return UserToken.generate(AccessType.RECOVERY, req.user._id, null, true);
        })
        .then(recoveryToken => {
            // Send recovery mail
            Mailer.sendRecoveryMail(req.user.email, recoveryToken.payload);
		
            res.json(JsonResponse.success(new ServiceSuccess(SUCCESS_VALUE.account_password_recovery_email_sent), {
                recoveryToken: recoveryToken.value
            }));
        })
        .catch(error => {
            ServiceError.handle(error, res, req.fullUrl);
        });
});

/**
 * Resends a password recovery email to a user
 */
router.post("/password-recovery/email", passwordRecoveryResendVerify, recoveryTokenVerify, (req, res) => {
    // Delete existing recovery token
    UserToken.delete(AccessType.RECOVERY, req.user._id)
        .then(() => {
            // Generate new recovery token
            return UserToken.generate(AccessType.RECOVERY, req.user._id, null, true);
        })
        .then(recoveryToken => {
            // Resend recovery mail
            Mailer.sendRecoveryMail(req.user.email, recoveryToken.payload);

            res.json(JsonResponse.success(new ServiceSuccess(SUCCESS_VALUE.account_password_recovery_email_sent), {
                recoveryToken: recoveryToken.value
            }));
        })
        .catch(error => {
            ServiceError.handle(error, res, req.fullUrl);
        });
});

/**
 * Verifies the password recovery code of a user
 */
router.post("/password-recovery/verification", passwordRecoveryCodeVerify, recoveryTokenVerify, (req, res) => {
    Promise.resolve()
        .then(() => {
            // Check if recovery code matches
            if (req.recoveryToken.payload !== req.body.recoveryCode)
                throw new ServiceError(ERROR_VALUE.recovery_code_invalid);

            res.json(JsonResponse.success(new ServiceSuccess(SUCCESS_VALUE.account_password_recovery_code_valid)));
            })
        .catch(error => {
            ServiceError.handle(error, res, req.fullUrl);
        });
});

/**
 * Sets a new password for the user SECOND STEP
 */
router.post("/password-recovery/password", changePasswordRecoveryVerify, recoveryTokenVerify, (req, res) => {
    Promise.resolve()
        .then(() => {
            // Check if recovery code matches
            if (req.recoveryToken.payload !== req.body.recoveryCode)
                throw new ServiceError(ERROR_VALUE.recovery_code_invalid);

            // Set new user password
            return req.user.setPassword(req.body.password);
        })
        .then(() => {
            // Delete existing recovery token
            return UserToken.delete(AccessType3.RECOVERY, req.user._id);
        })
        .then(() => {
            res.json(JsonResponse.success(new ServiceSuccess(SUCCESS_VALUE.account_password_reset)));
        })
        .catch(error => {
            ServiceError.handle(error, res, req.fullUrl);
        });
});



module.exports = router;

