const { query, body, param, check } = require("express-validator");

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
