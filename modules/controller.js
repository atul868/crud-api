const { hashPasswordUsingBcrypt } = require('../utils/auth');
const bcrypt = require('bcrypt');
const message = require('../utils/message');
const response = require('../utils/response');
const auth = require('../utils/auth');

const { createUser, checkUserExist, updateUserData, updatePassword, showAllUser, removeUser } = require('./dbQuery');

/**
* userSignup - function to create user
* @param {*} req 
* @param {*} res 
* @returns 
*/
exports.userSignup = async function (req, res) {
    try {
        const userData = req.body;
        const userExist = await checkUserExist({ userName: userData.userName });
        if (userExist) return res.json(response.success(405, message.user.userExist));
        const pass = await hashPasswordUsingBcrypt(req.body.password);
        userData.password = pass;
        if (!userExist) {
            const createUserRes = await createUser(userData);
            return res.json(response.success(201, message.user.user_add));
        }
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.catch_error, error));
    }
}

/**
* userLogin - function to user Login
* @param {*} req 
* @param {*} res 
* @returns 
*/
exports.userLogin = async function (req, res) {
    try {
        const { userName, password } = req.body;
        const userData = await checkUserExist({ userName: userName });
        if (!userData) return res.json(response.success(200, message.user.user_not_exist));
        if (userData.isDelete==true) return res.json(response.success(200, message.user.active_user));
        const result = await bcrypt.compare(password, userData.password);
        if (!result)
            return res.json(response.success(204, message.user.wrong_userName_password));
        const token = auth.generateToken({ userId: userData._id });
        userData.authToken = token;
        return res.json(response.success(200, message.user.user_login_success, { token: token }));
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.catch_error, error));
    }
}


/**
* updateUserProfile- function to update User Profile
* @param {*} req 
* @param {*} res 
* @returns 
*/
exports.updateUserProfile = async function (req, res) {

    try {
        let userData;
        if (req.user[0].role == 1) {//role 1 = user
            req.body.user_id = req.user[0]._id;//auth user will take user_id from token and admin will take from req.body
            userData = req.body;
            console.log('console.log(userData);', userData);
        }
        else { userData = req.body; }

        if (userData) {
            const updatedUserData = await updateUserData(userData);
            return res.json(response.success(201, message.user.UPDATE, { updatedUserData: updatedUserData }));
        } else { res.json(response.failure(204, message.user.FAILURE_UPDATE)); }
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.catch_error, error));
    }
}


/**
* updatePassword- function to update Password
* @param {*} req 
* @param {*} res 
* @returns 
*/
exports.updatePassword = async function (req, res) {
    try {
        let userId;
        if (req.user[0].role == 1) {//role 1 = user
            userId = req.user[0]._id;
        } else if (req.user[0].role == 2) {//role 2 = admin
            userId = req.body.userId;
        }
        if (req.body.newPassword !== req.body.confirmPassword) {
            return res.json(response.success(201, message.user.confirmPassword));
        }
        const newPasswords = await hashPasswordUsingBcrypt(req.body.newPassword);
        const passUpdateRes = await updatePassword(userId, newPasswords, req.body.newPassword, res);

        if (passUpdateRes) {
            return res.json(response.success(201, message.user.password_update));
        }
        else if (passUpdateRes) { res.json(response.failure(204, message.user.FAILURE_PASSWORD_UPDATE)); }
        else if (passUpdateRes == 0) {
            return res.json(response.failure(204, message.user.update_password_error));
        }
    } catch (error) {
        console.log(error, 'error')
        return res.json(response.failure(204, message.catch_error, error));
    }
}


/**
* getAllUser- function to  get All User
* @param {*} req 
* @param {*} res 
* @returns 
*/
exports.getAllUser = async function (req, res) {

    try {
        const userList = await showAllUser();
        if (userList.length > 0) {
            return res.json(response.success(200, message.user.READ, { userList: userList }));
        }
        else { res.json(response.failure(204, message.user.READ_ERROR)); }
    } catch (error) {
        return res.json(response.failure(204, message.catch_error, error));
    }
}

/**
* getAldeleteUserlUser- function to  deleteUser
* @param {*} req 
* @param {*} res 
* @returns 
*/
exports.deleteUser = async function (req, res) {
    try {
        const userData = await checkUserExist({ _id: req.params.user_id });
        console.log(userData);
        if (userData.isDelete == false) {
            const removedUser = await removeUser(req.params.user_id);
            if (removedUser) {
                return res.json(response.success(200, message.user.DELETE));
            }
            else { res.json(response.failure(204, message.user.FAILURE_DELETE)); }
        }
        else { res.json(response.failure(204, message.user.DELETED)); }
    } catch (error) {
        console.log(error);
        return res.json(response.failure(204, message.catch_error, error));
    }
}
