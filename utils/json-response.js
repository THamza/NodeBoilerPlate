"use strict";

class JsonResponse {
  /**
   * Constructs a JSON success object for a successful API request
   */
  static success(serviceSuccess, data) {
    return {
      status: "success",
      success: serviceSuccess.success,
      data: data
    };
  }
  
  /**
   * Constructs a JSON error object for a failed API request
   */
  static error(serviceError) {
    return {
      status: "fail",
      error: serviceError.error
    };
  }
}

module.exports = JsonResponse;