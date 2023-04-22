const joi = require('joi');
exports.signupFormVailidator = joi.object({
    userName: joi.string().required(),
    password: joi.string().required(),
});

exports.loginFormVailidator = joi.object({
    userName: joi.string().required(),
    password: joi.string().required(),
});

exports.updateUserProfileVailidator = joi.object({
    user_id: joi.string().hex().length(24).required().optional(),
    firstName: joi.string().optional(),
    lastName: joi.string().optional(),
    email: joi.string().email().optional(),
    image: joi.string().optional()
});
exports.updatePasswordVailidator = joi.object({
    newPassword: joi.string().required(),
    confirmPassword: joi.string().required()
});

exports.deleteUserVailidator = joi.object({
    user_id: joi.string().hex().length(24).required(),
});
