"use strict";

const HashId = require("hashids");
const hashId = new HashId(process.env.HASH_KEY, 20, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");

class Hasher {
  /**
   * Generates a unique hash
   */
  static dedupeSteps(arr) {
    return arr.reduce(function (p, c) {

      // create an identifying id from the object values
      var id = c.hashedIDStep;

      // if the id is not found in the temp array
      // add the object to the output array
      // and add the key to the temp array
      if (p.temp.indexOf(id) === -1) {
        p.out.push(c);
        p.temp.push(id);
      }
      return p;

      // return the deduped array
    }, { temp: [], out: [] }).out;
  }
}

module.exports = Hasher;