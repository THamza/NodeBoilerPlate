"use strict"

const appAuthVerify = require("../middlewares/app-auth-verify");
const {ERROR_VALUE, ServiceError} = require("../service/service-error");
const {AccessType, UserToken} = require("../database/models/user-token");
const {SUCCESS_VALUE, ServiceSuccess} = require("../service/service-success");
const Promise = require("bluebird");
const bcrypt = Promise.promisifyAll(require("bcryptjs"));
const User = require("../database/models/user");
const Comment = require("../database/models/comment");
const Conversation = require("../database/models/conversation");
const {Log, LogType} = require("../database/models/log");
const JsonResponse = require("../utils/json-response");

const moment = require("moment");

var express = require('express');
var router = express.Router();


/**
 * Creates a new Comment
 */
router.post("/:hashedID/comment/create", appAuthVerify, (req, res) => {
    let hashedID = req.params.hashedID;

    User.findByHashedID(hashedID)
        .then(user => {
            if(!user)
                throw new ServiceError(ERROR_VALUE.account_does_not_exist);

            return Comment.createNewConversation(req.body.content, req.body.type, req.body.hashedIDElementToComment, hashedID);
        })
        .then(data => {
            res.json(JsonResponse.success(new ServiceSuccess(SUCCESS_VALUE.comment_creation_success)))
        })
        .catch(error => {
            ServiceError.handle(error, res, req.fullUrl);
        });
});

/**
 * Get all the comments of an elmeent
 * @type {Router|GET}
 */
router.get("/:hashedID/comment/:hashedIDComment", appAuthVerify, (req, res) => {
    let hashedIDComment = req.params.hashedIDComment;
    let hashedID = req.params.hashedID;

    User.findByHashedID(hashedID)
        .then(user => {
            if (!user)
                throw new ServiceError(ERROR_VALUE.account_does_not_exist);

            return Comment.getAllCommentsOfAnElement(hashedIDComment);
        })
        .then(data => {
            res.json(JsonResponse.success(new ServiceSuccess(SUCCESS_VALUE.getting_conversations_success),
                data))
        })
        .catch(error => {
            ServiceError.handle(error, res, req.fullUrl);
        });
});


module.exports = router;
