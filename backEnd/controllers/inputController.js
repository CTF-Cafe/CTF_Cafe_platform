const ObjectId = require("mongoose").Types.ObjectId;

exports.validateRequestBody = function(body, validationObject) {
    for (const [key, validation] of Object.entries(validationObject)) {
      const value = body[key];
      if (validation.required && (value === undefined || value === '')) {
        throw new Error(`${key} is required`);
      }
      if (validation.type === 'number' && isNaN(value)) {
        throw new Error(`${key} must be a number`);
      }
      if (validation.type === 'positiveNumber' && (isNaN(value) || parseInt(value) < 0)) {
        throw new Error(`${key} must be a positive number`);
      }
      if (validation.type === 'objectId' && (value !== '' && !ObjectId.isValid(value))) {
        throw new Error(`${key} must be a valid ObjectId`);
      }
      if (validation.type === 'array') {
        const parsedArray = JSON.parse(value);
        parsedArray.forEach((item, index) => {
          for (const [itemKey, itemValidation] of Object.entries(validation.itemValidation)) {
            const itemValue = item[itemKey];
            if (itemValidation.required && (itemValue === undefined || itemValue === '')) {
              throw new Error(`Item ${index} of ${key} must have ${itemKey} defined`);
            }
            if (itemValidation.type === 'number' && isNaN(itemValue)) {
              throw new Error(`Item ${index} of ${key} ${itemKey} must be a number`);
            }
            if (itemValidation.type === 'positiveNumber' && (isNaN(itemValue) || parseInt(itemValue) < 0)) {
              throw new Error(`Item ${index} of ${key} ${itemKey} must be a positive number`);
            }
          }
        });
      }
    }
  }
