"use strict";

const _ = require("lodash");
const mongoose = require("mongoose");
const moment = require("moment");
const User = require("./user");
const Promise = require("bluebird");
const Hasher = require("../../utils/hasher");
const {ERROR_VALUE, ServiceError} = require("../../service/service-error");

const PAGE_LIMIT = 20;

let conversationSchema = new mongoose.Schema({
        title: {
            type: String
        },
        description: {
            type: String,
            default: ""
        },
        picture: {
            type: String,
            default: ""
        },
        link: {
            type: String,
            default: ""
        },
        participants: {
            type: Array,
            default: []
        },
        topics: {
            type: Array,
            default: []
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        hashedIDConversation: {
            type: String,
            unique: true
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


class ConversationClass {

    /**
     * Creates a new conversation (Promise)
     **/
    static createNewConversation( title, description, picture, link, participants, topics) {
        let newConversation;
        newConversation = {
            title,
            description,
            link,
            participants,
            topics,
            picture,
            hashedIDConversation: "CONVERSATION" + Hasher.generate(Date.now() + process.pid)
        };
        return this.create(newConversation);
    }

    // static getConversation(conversationID) {
    //     let post = {};
    //     return this.findOne({_id: mongoose.mongo.ObjectId(conversationID)})
    //         .then(result => {
    //             return result;
    //         });
    // }

    static getAllConversations() {
        return this.find({})
            .then(result => {
                return result;
            });
    }

    static findByHashedID(hashedIDConversation) {
        return this.findOne({ hashedIDConversation });
    }

    static updateConversation(hashedIDConversation,title,description,picture,link,participants,topics) {
        return this.update({ hashedIDConversation },
            {
                title,
                description,
                picture,
                link,
                participants,
                topics
            })
            .then((result)=>{
                if(result.nModified)
                    return true;
                else
                    return false;
            })
    }


    static deleteConversation(hashedIDConversation) {
        return this.update({ hashedIDConversation },
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

conversationSchema.loadClass(ConversationClass);
let Conversation = mongoose.model("conversation", conversationSchema);

module.exports = Conversation;