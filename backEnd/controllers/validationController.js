const { check } = require("express-validator");
const ObjectId = require("mongoose").Types.ObjectId;

exports.username = (id = "username") =>
  check(id)
    .notEmpty()
    .withMessage("must not be empty")
    .trim()
    .isLength({ min: 1, max: 32 })
    .withMessage("must be >1 and <32")
    .matches(/^[^"$\n@]+$/)
    .withMessage("dont use any sus characters");

exports.password = (id = "password") =>
  check(id)
    .notEmpty()
    .withMessage("must not be empty")
    .trim()
    .isLength({ min: 8 })
    .withMessage("must be >8");

exports.email = (id = "email") =>
  check(id)
    .notEmpty()
    .withMessage("must not be empty")
    .trim()
    .isEmail()
    .withMessage("Not a valid Email");

exports.userCategory = (id = "userCategory") =>
  check(id).notEmpty().withMessage("must not be empty").trim();

exports.id = (id = "id") =>
  check(id)
    .notEmpty()
    .withMessage("must not be empty")
    .trim()
    .custom((val) => ObjectId.isValid(val))
    .withMessage("not a valid ObjectId")
    .customSanitizer((val) => ObjectId(val));

exports.page = (id = "page") =>
  check(id)
    .optional()
    .default(1)
    .isInt({ min: 0 })
    .withMessage("must be an int");

exports.search = (id = "search") =>
  check(id)
    .optional()
    .default("")
    .isString()
    .withMessage("must be a string")
    .customSanitizer((val) => new RegExp(val, "i"));

exports.teamName = (id = "teamName") =>
  check(id)
    .notEmpty()
    .withMessage("must not be empty")
    .trim()
    .isLength({ min: 1, max: 32 })
    .withMessage("must be >1 and <32")
    .matches(/^[^"$\n]+$/)
    .withMessage("dont use any sus characters");

exports.teamCode = (id = "teamCode") =>
  check(id)
    .notEmpty()
    .withMessage("must not be empty")
    .trim()
    .isUUID(4)
    .withMessage("must be a uuid");

exports.flag = (id = "flag") =>
  check(id).notEmpty().withMessage("must not be empty").trim();

exports.emoji = (id = "emoji") =>
  check(id)
    .notEmpty()
    .withMessage("must not be empty")
    .trim()
    .matches(/^[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]$/)
    .withMessage("must be an emoji!");
