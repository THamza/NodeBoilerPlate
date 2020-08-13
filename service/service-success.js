"use strict";

/**
 * Stores a colllection of success codes and messages that can be stored in a ServiceSuccess object
 */
const SUCCESS_VALUE = {
    connection_established: {code: 0, message: "Connection established"},
    account_signup_success: {code: 100, message: "account sign up successful"},
    account_signin_success: {code: 101, message: "user was signed in"},
    account_signout_success: {code: 102, message: "user was signed out"},
    account_activation_success: {code: 103, message: "activated account"},
    account_activation_email_sent: {code: 104, message: "sent activation email"},
    account_password_recovery_email_sent: {code: 105, message: "sent password recovery email"},
    account_password_recovery_code_valid: {code: 106, message: "valid recovery code"},
    account_password_changed: {code: 107, message: "changed account password"},
    account_password_reset: {code: 108, message: "reset account password"},
    user_info_retrieved: {code: 109, message: "retrieved user information"},
    admin_privilege_updated: {code: 118, message: "Admin privilege updated successfully"},
    admin_modified_success: {code: 119, message: "Admin modified successfully"},
    admins_retrieved: {code: 121, message: "All Admins successfully retrieved"},
    account_updated_successfully: {code: 125, message: "Account info has been updated successfully"},
    statistic_retrieved: {code:128, message:"Statistics has been retrieved successfully" },
    account_retrieved: {code:129, message:"Accounts retrieved successfully" },
    user_removed_from_participants_success: {code: 130, message:"User was successfully removed from participants list"},
    user_removed_from_fully_completed_success: {code: 131, message:"User was successfully removed from fully completed list"},
    users_retrieved: {code: 132, message:"Users Retrieved"},
    user_update_success: {code: 133, message:"Users updated successfully"},
    conversation_creation_success: {code: 134, message:"Conversation created successfully"},
    getting_conversations_success: {code: 135, message:"Conversation retrieved successfully"},
    comment_creation_success: {code: 136, message:"Comment created successfully"},

};

class ServiceSuccess {
    constructor(successValue) {
        if (typeof(successValue) === "string")
            this.success = SUCCESS_VALUE[successValue];
        else
            this.success = successValue;
    }
}

module.exports = {SUCCESS_VALUE, ServiceSuccess};





