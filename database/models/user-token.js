"use strict";

const _ = require("lodash");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const mongoose = require("mongoose");
const os = require("os");
const shajs = require("sha.js");
const Promise = require("bluebird");

// Types of token access
const AccessType = {
  ACTIVATION: "activation",
  RECOVERY: "recovery",
  APP: "app",
  QR: "qr",
};

// Expiry period of tokens
const TokenExpiry = {
  Activation: {
    VALUE: 4,
    PERIOD: "hours"
  },
  Recovery:  {
    VALUE: 1,
    PERIOD: "days"
  },
  App:  {
    VALUE: 3,
    PERIOD: "months"
  },
  QR:  {
    VALUE: 3,
    PERIOD: "months"
  }
};

let userTokenSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: [true, "User ID is required"],
    index: true
  },
  value: {
    type: String,
    required: [true, "Token value is required"],
    unique: [true, "Token already exists"],
  },
  payload: {
    type: Object
  },
  accessType: {
    type: String,
    enum: Object.values(AccessType),
    required: [true, "Token access type is required"],
    index: true
  },
  expiresAt: {
    type: Date,
    expires: 0,
  }
}, {
    timestamps: true
  });

userTokenSchema.index({ "createdAt": 1 });

class UserTokenClass {
  /**
   * Advances the expiry of the token (Promise)
   */
  advanceExpiry() {
    let accessType = this.accessType[0].toUpperCase() + this.accessType.substr(1);

    return this.update({
      $set: {
        expiresAt: moment().add(TokenExpiry[accessType].VALUE, TokenExpiry[accessType].PERIOD).toDate()
      }
    });
  }

  /**
   * Generates a new token based on a specified user ID, access type
   * and optional payload and stores it in the database.
   * Set isReturnFullToken to true to return the full properties of the token (Promise)
   */
  static generate(accessType, userId, payload, isReturnFullToken) {
    // Generate random seed
    let seed = {
      networkId: os.networkInterfaces(),
      time: Date.now(),
      procId: process.pid
    };

    // Generate SHA256 hash based on seed
    let value = shajs("sha512").update(JSON.stringify(seed)).digest("hex");
    let newToken = {
      user_id: userId,
      accessType
    };
    switch(accessType) {
      case AccessType.ACTIVATION:
        newToken.value = jwt.sign(value, process.env.JWT_MAIN_KEY).toString();
        newToken.expiresAt = moment().add(TokenExpiry.Activation.VALUE, TokenExpiry.Activation.PERIOD).toDate();
        newToken.payload = _.random(100000, 999999).toString(); // Generate random 6 digit number
        break;
      case AccessType.RECOVERY:
        newToken.value = jwt.sign(value, process.env.JWT_MAIN_KEY).toString();
        newToken.expiresAt = moment().add(TokenExpiry.Recovery.VALUE, TokenExpiry.Recovery.PERIOD).toDate();
        newToken.payload = _.random(100000, 999999).toString(); // Generate random 6 digit number
        break;
      case AccessType.APP:
        newToken.value = value;
        newToken.expiresAt = moment().add(TokenExpiry.App.VALUE, TokenExpiry.App.PERIOD).toDate();
        break;
      case AccessType.QR:
        newToken.value = value;
        newToken.expiresAt = moment().add(TokenExpiry.App.VALUE, TokenExpiry.App.PERIOD).toDate();
        break;
    }
    if (payload)
      newToken.payload = payload;
    // Create token in database
    return this.create(newToken)
      .then(token => {
        if (!isReturnFullToken)
          return token.value;
        else
          return token;
      });
  }

  /**
   * Returns a token based on a specified user ID and access type
   * Set isReturnFullToken to true to return the full properties of the token (Promise)
   */
  static get(accessType, userId, isReturnFullToken) {

    return this.findOne({
      user_id: userId,
      accessType
    })
      .then(token => {
        if (!token)
          return null;
        else if (!isReturnFullToken)
          return token.value;
        else
          return token;
      });
  }

  /**
   * Renews a token based on a specified user ID and access type (Promise)
   */
  static renew(accessType, userId) {
    // Delete existing token
    return this.delete(accessType, userId)
      .then(() => {
        // Generate new token
        return this.generate(accessType, userId);
      });
  }

  /**
   * Deletes a token based on a specified user ID and access type (Promise)
   */
  static delete(accessType, userId) {
    return this.remove({
      user_id: userId,
      accessType
    });
  }

  /**
   * Returns a token with a specified token value
   * Returns -1 if token decoding has failed (Promise)
   */
  static findByValue(tokenValue) {
    // Check if JWT
    if (tokenValue && tokenValue.split(".").length - 1 === 2) {
      try {
        // Verify JWT
        jwt.verify(tokenValue, process.env.JWT_MAIN_KEY);
      }
      catch(error) {
        return Promise.resolve(-1);
      }
    }

    return this.findOne({
      value: tokenValue
    }).populate("user_id");
  }

}

userTokenSchema.loadClass(UserTokenClass);
let UserToken = mongoose.model("usertoken", userTokenSchema);

module.exports = {
  AccessType,
  UserToken
};