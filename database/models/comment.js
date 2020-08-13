"use strict";

const _ = require("lodash");
const mongoose = require("mongoose");
const moment = require("moment");
const User = require("./user");
const Promise = require("bluebird");
const Hasher = require("../../utils/hasher");
const {ERROR_VALUE, ServiceError} = require("../../service/service-error");

const PAGE_LIMIT = 20;

let commentSchema = new mongoose.Schema({
        content: {
            type: String,
            default: ""
        },
        type: {
            type: String,
            default: ""
        },
        hashedIDComment: {
            type: String,
            default: ""
        },
        hashedIDElementToComment: {
            type: String,
            default: ""
        },
        hashedIDCommenter: {
            type: String,
            default: ""
        },
        isVisible: {
            type: Boolean,
            default: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
);


class CommentClass {

    /**
     * Creates a new comment (Promise)
     **/
    static createNewComment( content, type, hashedIDElementToComment, hashedIDCommenter) {
        let newComment;
        newComment = {
            content,
            type,
            hashedIDElementToComment,
            hashedIDCommenter,
            hashedIDComment: "COMMENT" + Hasher.generate(Date.now() + process.pid)
        };
        // Create new event in database
        return this.create(newComment);
    }

    // static getConversation(conversationID) {
    //     let post = {};
    //     return this.findOne({_id: mongoose.mongo.ObjectId(conversationID)})
    //         .then(result => {
    //             return result;
    //         });
    // }

    static getAllCommentsOfAnElement(hashedIDElementToComment) {
        return this.find({hashedIDElementToComment})
            .then(result => {
                return result;
            });
    }

    static findByHashedID(hashedIDComment) {
        return this.findOne({ hashedIDComment });
    }


    static deleteComment(hashedIDComment) {
        return this.update({ hashedIDComment },
            {
                isDeleted: true,
                isVisible: false
            })
            .then((result) => {
                if(result.nModified)
                    return true;
                else
                    return false;
            })
    }


}

commentSchema.loadClass(CommentClass);
let Conversation = mongoose.model("comment", commentSchema);

module.exports = Conversation;