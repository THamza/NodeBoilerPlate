"use strict";



const _ = require("lodash");
const mongoose = require("mongoose");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const Promise = require("bluebird");
const validator = require("validator");
const {AccessType, UserToken} = require("./user-token");
const Hasher = require("../../utils/hasher");
const {ERROR_VALUE, ServiceError} = require("../../service/service-error");

const bcrypt = Promise.promisifyAll(require("bcryptjs"));

// Number of salt rounds used to hash password
const SALT_ROUNDS = 12;
// Number of days account expires in
const ACCOUNT_EXPIRY_PERIOD = 1;
// Number of elements to send per paginated request
const PAGE_LIMIT = 20;

let userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: false,
        index: true,
        unique: false
    },
    firstName: {
        type: String,
        required: false,
        index: true,
        unique: false
    },
    lastName: {
        type: String,
        required: false,
        index: true,
        unique: false
    },
    email: {
        type: String,
        // required: [true, "Email is required"],
        unique: [true, "Email is already in use"],
        index: true
    },
    isActivated: {
        type: Boolean,
        default: false
    },
    hashedID: {
        type: String,
        unique: [true, "hashedID must be unique"]
    },
    phoneNumber: {
        type: String,
        // required: [true, "PhoneNumber is required"],
        unique: [false, "This phone number is already in use"],
    },
    password: {
        type: String,
        // required: [true, "Password is required"],
        minlength: [8, "Password must have at least 8 characters"]
    },
    gender: { // gender 0: female | 1: male | 2: added using id and name only | 3: added using automation and no gender was specified
        type: Number,
        // required: [true, "Gender is not required"]
    },
    picture: {
        type: String,
        default: ""
    },
    permissions: {
        type: Array,
        default: []
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isAdmin: {
      type: Boolean,
      default: false
    }},
    {
        timestamps: true
    }

);



class UserClass {

    /**
     * Sets a new password for the user (Promise)
     */
    setPassword(password) {
        // Hash password
        return bcrypt.hashAsync(password, SALT_ROUNDS)
            .then(hashedPassword => {
                return this.update({
                    $set: {
                        password: hashedPassword
                    }
                });
            });
    }

    /**
     * Checks if the specified password hashes to the stored password (Promise)
     */
    isPasswordEqual(password) {
        // Compare password with stored hash in database
        return bcrypt.compareAsync(password, this.password)
            .then(result => {
                if (result)
                    return true;
                else
                    return false;
            });
    }

    /**
     * Activates the user account (Promise)
     */
    activateAccount() {
        // Delete existing activation token
        UserToken.delete(AccessType.ACTIVATION, this._id)
            .then(() => {
                return this.update({
                    $set: {
                        isActivated: true
                        // isActive: true
                    }
                    // ,
                    // $unset: {
                    //     expiresAt: ""
                    // }
                });
            });
    }

    /**
     * Creates a new user with a specified firstName, lastName, auiID, email, password, phoneNumber, country, gender, dateOfBirth and IP address (Promise)
     */
    static createNew(firstName, lastName, username, email, password, phoneNumber, gender) {
        let user;
        let hashedIDValue = Hasher.generate(email);

        return bcrypt.hashAsync(password, SALT_ROUNDS)
            .then(hashedPassword => {
                let newUser = {
                        firstName,
                        lastName,
                        username,
                        email,
                        password: hashedPassword,
                        gender,
                        phoneNumber,
                        hashedID: hashedIDValue
                    };

                // Get IP address if it exists
                // if (ipAddress)
                //     newUser.ipAddress = ipAddress;

                // Create new user in database
                return this.create(newUser);
            })
            .then(createdUser => {
                user = createdUser;

                // Generate activation token
                return UserToken.generate(AccessType.ACTIVATION, user._id);
            })
            .then(() => {
                return user;
            });
    }

    /**
     * Sets the value of isAdmin
     */
    static setAdmin(hashedID,boolean) {
        return this.findOneAndUpdate({hashedID} , {isAdmin : boolean})
    }
    /**
     * Updates gender of the user
     */
    static setGender(value) {
        return this.update({
            $set: {
                gender: value
            }
        });
    }

    /**
     * Returns a user account with a specified email/username and password (Promise)
     */
    static findByCredentials(identity, password) {
        let user;

        return this.findOne({
            $or: [
                { email: identity },
                { username: identity },
                { phoneNumber: identity },
            ]
        }).then(userResult => {
            if (!userResult)
                throw new Error("User not found");

            user = userResult;
            if(user.isActivated === false) {
                throw new Error("Account not activated");
            }
            // Compare password with stored hash in database
            return bcrypt.compareAsync(password, user.password);
        })
            .then(result => {
                if (!result)
                    return -1;
                else
                    return user;
            })
            .catch(() => {
                return user;
            });
    }


    /**
     * Returns a user account with a specified email/auiID and password (Promise)
     */
    static searchByCredentials(identity) {
        let user;

        return this.find({
            $or: [
                { email: { "$regex": "^" + identity, '$options' : 'i' } },
                { username: { "$regex": "^" + identity, '$options' : 'i'} },
                { phoneNumber: { "$regex": "^" + identity, '$options' : 'i'} },
            ]
        }).then(userResult => {
            if (!userResult)
                throw new Error("User not found");

            return userResult;
        })
    }

    /**
     * Returns a user account with a specified email/auiID (Promise)
     */
    static findByIdentity(identity) {
        return this.findOne({
            $or: [
                { email: identity },
                { phoneNumber: identity },
                { username: identity },
            ]
        });
    }

    /**
     * Returns a user account with a specified email (Promise)
     */
    static findByEmail(email) {
        return this.findOne({ email });
    }

    static findByHashedID(hashedID) {
        return this.findOne({ hashedID });
    }

    static findByPhoneNumber(phoneNumber) {
        return this.findOne({phoneNumber});
    }

    static findByToken(token) {
        if (!token)
            return Promise.resolve(null);

        // Check if JWT
        if (token.split(".").length - 1 === 2) {
            try {
                // Verify JWT
                jwt.verify(token, process.env.JWT_MAIN_KEY);
            }
            catch(error) {
                return Promise.resolve(-1);
            }
        }

        return UserToken.findByValue(token)
            .then(token => {
                if (!token)
                    return null;

                return token.user_id;
            });
    }


    static getProfileData(hashedID){
        return this.findOne({hashedID:hashedID})
            .then((user) => {
                if(user)
                    return {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        hashedID: user.hashedID,
                        phoneNumber: user.phoneNumber,
                        permissions: user.permissions
                    }
            })
    }


}

userSchema.loadClass(UserClass);
let User = mongoose.model("user", userSchema);

module.exports = User;
