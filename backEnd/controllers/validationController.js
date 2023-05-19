const { check } = require("express-validator");
const ObjectId = require("mongoose").Types.ObjectId;

function validObjectId(val) {
  if (!ObjectId.isValid(val)) {
    throw new Error("Invalid ObjectId");
  }
}

exports.username = check("username")
  .notEmpty()
  .withMessage("must not be empty")
  .trim()
  .isLength({ min: 4, max: 32 })
  .withMessage("must be >4 and <32")
  .matches(/^[^"$\n]+$/)
  .withMessage("dont use any sus characters");

exports.password = check("password")
  .notEmpty()
  .withMessage("must not be empty")
  .trim()
  .isLength({ min: 8 })
  .withMessage("must be >8");

exports.email = check("email")
  .notEmpty()
  .withMessage("must not be empty")
  .trim()
  .isEmail()
  .withMessage("Not a valid Email");

exports.userCategory = check("userCategory")
  .notEmpty()
  .withMessage("must not be empty")
  .trim();

exports.id = check("id")
  .notEmpty()
  .withMessage("must not be empty")
  .trim()
  .custom((val) => ObjectId.isValid(val))
  .withMessage("not a valid ObjectId")
  .customSanitizer((val) => {
    if (ObjectId.isValid(val)) {
      ObjectId(val);
    }
  });

exports.page = check("page")
  .optional()
  .default(1)
  .isInt({ min: 0 })
  .withMessage("must be an int");

exports.search = check("search")
  .optional()
  .isString()
  .withMessage("must be a string")
  .customSanitizer((val) => new RegExp(val, "i"));

exports.teamName = check("teamName")
  .notEmpty()
  .withMessage("must not be empty")
  .trim()
  .isLength({ min: 4, max: 32 })
  .withMessage("must be >4 and <32")
  .matches(/^[^"$\n]+$/)
  .withMessage("dont use any sus characters");


