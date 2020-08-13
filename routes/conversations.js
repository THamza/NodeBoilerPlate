"use strict"

const appAuthVerify = require("../middlewares/app-auth-verify");
const {ERROR_VALUE, ServiceError} = require("../service/service-error");
const {AccessType, UserToken} = require("../database/models/user-token");
const {SUCCESS_VALUE, ServiceSuccess} = require("../service/service-success");
const Promise = require("bluebird");
const bcrypt = Promise.promisifyAll(require("bcryptjs"));
const User = require("../database/models/user");
const Conversation = require("../database/models/conversation");
const {Log, LogType} = require("../database/models/log");
const JsonResponse = require("../utils/json-response");

const moment = require("moment");

var express = require('express');
var router = express.Router();


/**
 * Creates a new Conversation
 */
router.post("/:hashedID/conversation/create", appAuthVerify, (req, res) => {
    let hashedID = req.params.hashedID;

    User.findByHashedID(hashedID)
        .then(user => {
            if(!user)
                throw new ServiceError(ERROR_VALUE.account_does_not_exist);

            return User.isAdmin(user);
        })
        .then(isAdmin => {
            if(!isAdmin)
                throw new ServiceError(ERROR_VALUE.not_an_admin);

            return Conversation.createNewConversation(req.body.title, req.body.description, req.body.picture, req.body.link, req.body.participants, req.body.topics);
        })
        .then(data => {
            res.json(JsonResponse.success(new ServiceSuccess(SUCCESS_VALUE.conversation_creation_success)))
        })
        .catch(error => {
            ServiceError.handle(error, res, req.fullUrl);
        });
});
//
// /**
//  * Update an existing conversation
//  * @type {Router|router}
//  */
// router.post("/:hashedID/events/:eventHashedID/update", updateEventVerify,appAuthVerify, (req, res) => {
//     let hashedID = req.params.hashedID;
//     let eventHashedID = req.params.eventHashedID;
//     let newAdminID;
//
//
//     let eventTitleUpdated;
//     let hashedIDEventUpdated;
//
//     User.findByHashedID(hashedID)
//         .then(user => {
//             if (!user)
//                 throw new ServiceError(ERROR_VALUE.account_does_not_exist);
//
//             return User.isAdmin(user);
//         })
//         .then(isAdmin => {
//             if(!isAdmin)
//                 throw new ServiceError(ERROR_VALUE.not_an_admin);
//
//             return Event.findByHashedID(eventHashedID);
//         })
//         .then(event => {
//             if (!event)
//                 throw new ServiceError(ERROR_VALUE.event_not_exist);
//
//             eventTitleUpdated = event.eventTitle;
//             hashedIDEventUpdated = event.hashedIDEvent;
//
//             return User.getUserDataByAUIID(req.body.adminAUIID);
//         })
//         .then(user => {
//             if(!user)
//                 throw new ServiceError(ERROR_VALUE.account_does_not_exist);
//
//             newAdminID = user.hashedID;
//             return User.isAdmin(user);
//         })
//         .then(isAdmin => {
//             if(!isAdmin)
//                 throw new ServiceError(ERROR_VALUE.not_an_admin);
//
//             return Event.updateEvent(eventHashedID, newAdminID, req.body.eventTitle, req.body.eventDescription, req.body.maxParticipants, req.body.organizer);
//         })
//         .then(isUpdated => {
//             if(!isUpdated)
//                 throw new ServiceError(ERROR_VALUE.could_not_update_event);
//
//             res.json(JsonResponse.success(new ServiceSuccess(SUCCESS_VALUE.event_update_success),{eventTitleUpdated,hashedIDEventUpdated}))
//         })
//         .catch(error => {
//             ServiceError.handle(error, res, req.fullUrl);
//         });
// });
//
// /**
//  * Deleting an existing conversation
//  * @type {Router|router}
//  */
// router.post("/:hashedID/events/:eventHashedID/delete", appAuthVerify, (req, res) => {
//     let hashedID = req.params.hashedID;
//     let eventHashedID = req.params.eventHashedID;
//
//     let eventTitleDeleted;
//     let hashedIDEventDeleted;
//
//     let theEvent;
//
//     User.findByHashedID(hashedID)
//         .then(user => {
//             if (!user)
//                 throw new ServiceError(ERROR_VALUE.account_does_not_exist);
//
//             return User.isAdmin(user);
//         })
//         .then(isAdmin => {
//             if(!isAdmin)
//                 throw new ServiceError(ERROR_VALUE.not_an_admin);
//
//             return Event.findByHashedID(eventHashedID);
//         })
//         .then(event => {
//             if (!event)
//                 throw new ServiceError(ERROR_VALUE.event_not_exist);
//
//             theEvent = event;
//
//             eventTitleDeleted = event.eventTitle;
//             hashedIDEventDeleted = event.hashedIDEvent;
//
//             return Event.deleteEvent(eventHashedID);
//         })
//         .then((isUpdated) => {
//             if(!isUpdated)
//                 throw new ServiceError(ERROR_VALUE.could_not_update_event);
//
//             return Step.deleteSteps(theEvent.stepsIDs);
//         })
//         .then(data => {
//
//             res.json(JsonResponse.success(new ServiceSuccess(SUCCESS_VALUE.event_update_success),{eventTitleDeleted,hashedIDEventDeleted}))
//         })
//         .catch(error => {
//             ServiceError.handle(error, res, req.fullUrl);
//         });
// });


/**
 * Get all the conversations
 * @type {Router|GET}
 */
router.get("/:hashedID/all", appAuthVerify, (req, res) => {
    let hashedID = req.params.hashedID;

    User.findByHashedID(hashedID)
        .then(user => {
            if (!user)
                throw new ServiceError(ERROR_VALUE.account_does_not_exist);

            return Conversation.getAllConversations();
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
