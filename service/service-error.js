"use strict";

const JsonResponse = require("../utils/json-response");
const {Log, LogType} = require("../database/models/log");

/**
 * Stores a colllection of error codes and messages that can be stored in a ServiceError object
 */
const ERROR_VALUE = {
    service_internal_error: {code: 1, message: "service is unable to process your request."},
    service_unavailable: {code: 2, message: "service unavailable."},
    service_unauthorized: {code: 3, message: "unauthorized to access service"},
    resource_not_found: {code: 4, message: "item not found"},
    json_invalid_format: {code: 5, message: "invalid JSON format received"},
    app_token_invalid: {code: 6, message: "invalid app token"},

    account_not_found: {code: 100, message: "account not found"},
    account_email_exists: {code: 101, message: "an account with this email already exists"},
    account_auiID_exists: {code: 102, message: "an account with this Aui ID already exists"},
    account_phoneNumber_exists: {code: 103, message: "an account with this phone number already exists"},
    
    account_signin_invalid: {code: 104, message: "invalid account credentials"},
    account_not_activated: {code: 105, message: "account has not been activated"},
    account_activation_expired: {code: 106, message: "activation token has expired"},
    account_activation_invalid: {code: 107, message: "invalid activation token"},
    account_activation_exists: {code: 108, message: "account already activated"},
    account_password_recovery_expired: {code: 109, message: "recovery token has expired"},
    account_password_recovery_invalid: {code: 110, message: "invalid recovery token"},
    account_user_image_removal_failed: {code: 111, message: "unable to remove user image"},

    firstName_required: {code: 200, message: "A first name is required"},
    firstName_not_string: {code: 201, message: "First name is not valid"},
    firstName_invalid_char: {code: 202, message: "First name contains invalid characters"},
    firstName_exceed_length: {code: 203, message: "First name exceeds allowed length"},

    lastName_required: {code: 204, message: "A last name is required"},
    lastName_not_string: {code: 205, message: "Last name is not valid"},
    lastName_invalid_char: {code: 206, message: "Last name contains invalid characters"},
    lastName_exceed_length: {code: 207, message: "Last name exceeds allowed length"},

    username_required: {code: 208, message: "A username is required"},
    username_required_not_string: {code: 209, message: "Username is not valid"},
    username_invalid_char: {code: 210, message: "Username invalid format"},

    email_required: {code: 211, message: "Email is required"},
    email_not_string: {code: 212, message: "Email is not valid"},
    email_invalid: {code: 213, message: "Invalid email address"},
    
    password_required: {code: 214, message: "Password is required"},
    password_not_string: {code: 215, message: "Password is not a string"},
    password_length: {code: 216, message: "Password must have at least 8 characters"},
    password_confirm_required: {code: 217, message: "Confirmation password is required"},
    password_confirm_not_string: {code: 218, message: "Confirmation password is not a string"},
    password_mismatch: {code: 219, message: "Password fields do not match"},
    
    phoneNumber_confirm_required: {code: 220, message: "Phone number required"},
    phoneNumber_confirm_not_string: {code: 221, message: "Phone number is not a string"},
    phoneNumber_invalid_char: {code: 222, message: "Phone number must be entirely numeric"},

    gender_confirm_required: {code: 226, message: "Gender required"},
    gender_confirm_required_not_numeric: {code: 227, message: "Gender is not a numeric"},
    gender_length: {code: 228, message: "Gender must be one single digit"},


    account_does_not_exist: {code: 252, message:"Account does not exist"},

    not_an_admin: {code: 259, message:"An Admin is required for this request"},
    mailer_error: {code: 260, message:"Mailing Error"},
    start_date_required: {code:270, message: "A start date is required"},
    end_date_required: {code:271, message: "An end date is required"},
    start_date_invalid: {code:272, message: "Start date is invalid"},
    end_date_invalid: {code:273, message: "End date is invalid"},


    IDs_required: {code: 278, message: "List of IDs is required"},
    hashedID_required_not_string: {code: 279, message: "Hashed ID is invalid"},
    hashedID_required: {code: 280, message: "Hashed ID is required"},
    error_uploading_attachment: {code: 283, message: "Couldn't upload your attachment"},
    

    expiry_date_time_not_found: {code: 560, message: "expiry date time not found"},
    expiry_date_time_not_date: {code: 561, message: "expiry date time is not a date"},

    name_required: {code: 562, message: "name is required"},
    name_not_string: {code: 563, message: "name is not a string"},
    name_invalid_char: {code: 564, message: "name contains invalid characters"},
    name_exceed_length: {code: 565, message: "name exceeds allowed length"},
    merchantId_not_found: {code: 566, message: "merchant id not found"},

    activation_token_required: {code: 300, message: "activation token is required"},
    activation_token_not_string: {code: 301, message: "activation token is not a string"},
    activation_code_required: {code: 302, message: "activation code is required"},
    activation_code_not_string: {code: 303, message: "activation code is not a string"},
    activation_code_invalid: {code: 304, message: "invalid activation code"},

    recovery_token_required: {code: 400, message: "Recovery token is required"},
    recovery_token_not_string: {code: 401, message: "Recovery token is not a string"},
    recovery_code_required: {code: 402, message: "Recovery code is required"},
    recovery_code_not_string: {code: 403, message: "Recovery code is not a string"},
    recovery_code_invalid: {code: 404, message: "Invalid recovery code"},

    image_file_format_invalid: {code: 700, message: "invalid image file format"},
    correct_image_file_required: {code: 701, message: "number of attached images exceeds the limit (max:10)"},
    image_file_size_exceed_limit: {code: 702, message: "image file size exceeds limit"},

    user_not_found: {code: 1100, message: "user not found"},
    post_not_found: {code: 1104, message: "post not found"},
    post_not_found_in_user_document: {code: 1105, message: "post not found in user's document"},

    value_not_found: {code: 1200, message: "value not found"},
    value_not_string: {code: 1201, message: "value is not a string"},
    value_not_numeric: {code: 1202, message: "value is not a numeric"},
    value_not_boolean: {code: 1203, message: "value is not a boolean"},
    value_not_array: {code: 1204, message: "value is not an array"},

};

class ServiceError extends Error {
    constructor(errorValue) {
        super();
        if (typeof(errorValue) === "string")
            this.error = ERROR_VALUE[errorValue];
        else
            this.error = errorValue;
    }


    /**
     * Handles service errors with the appropriate status code
     */
    static handle(error, res, source) {
        if (error instanceof SyntaxError) {
            res.status(400)
                .json(JsonResponse.error(new ServiceError(ERROR_VALUE.json_invalid_format)));
        }
        else if (error instanceof ServiceError) {
            let statusCode;
            switch (error.code) {
                case ERROR_VALUE.service_unauthorized.code:
                    statusCode = 401;
                    break;
                case ERROR_VALUE.resource_not_found.code:
                    statusCode = 404;
                    break;
                default:
                    statusCode = 400;
                    break;
            }

            res.status(statusCode).json(JsonResponse.error(error));
        } else {
            Log.createNew(LogType.ERROR, error.stack, source);
            console.error(error);

            res.status(500)
                .json(JsonResponse.error(new ServiceError(ERROR_VALUE)));
        }
    }
}

module.exports = {ERROR_VALUE, ServiceError};