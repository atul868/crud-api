var ObejctID = require("mongoose").Types.ObjectId
const { user, userDeatail, role, userLastPassword } = require("./schema");
var round = require('mongo-round');
const response = require('../utils/response');
const message = require('../utils/message');

/**
* checkEmpExist- function to check Employee Exist
* @param {*} data
* @returns 
*/
module.exports.checkUserExist = async (data) => {
    return await user.findOne(data);
}

/**
* getEmail- function to check get Email
* @param {*} data
* @returns 
*/
module.exports.getEmail = async (userId) => {
    console.log('getemail');
    return await userDeatail.findOne({user_id:userId},{email:1});
}


/**
* checkEmpExist- function to check Employee Exist
* @param {*} req 
* @param {*} res 
* @returns 
*/
module.exports.createUser = async (data) => {
    let res1 = await user.create(data);
    if (res1) {
        await role.create({ user_id: ObejctID(res1._id) });
    }
    return res1;
}

/**
* checkEmpExist- function to check Employee Exist
* @param {*} data
* @returns 
*/
module.exports.getUser = async (data) => {
    return await user.aggregate([
        {
            $lookup: {
                from: "roles",
                localField: "_id",
                foreignField: "user_id",
                as: "userData",
            },
        },
        {
            $unwind: {
                'path': '$userData',
                'preserveNullAndEmptyArrays': false
            }
        },
        {
            $match: { _id: ObejctID(data) }
        }, {
            $project: {
                '_id': 1,
                'role': '$userData.role_id'
            }
        }
    ])
}

/**
* updateUserData- function to update User Data
* @param {*} data
* @returns 
*/
module.exports.updateUserData = async (data) => {
    let res = await userDeatail.findOne({ user_id: data.user_id });
    if (!res) {
        return await userDeatail.create(data);
    }
    else {
        return await userDeatail.findOneAndUpdate({
            user_id: ObejctID(data.user_id)
        }, {
            ...data
        }, {
            new: true
        }).lean();
    }
}

/**
* updatePassword- function to update Password
* @param {*} userId 
* @param {*} newPassword 
* @returns 
*/
module.exports.updatePassword = async (userId, newEncreptedPassword, newPassword, res) => {
    let lastfivePass = await userLastPassword.aggregate([{ $sort: { _id: -1 } }, { $limit: 5 }]);
    let count = 1;
    lastfivePass.forEach((element) => {
        if (element.lastPassword == newPassword) { count++; }
    });
    if (count == 1) {
        let passUpdateRes = await user.updateOne({ _id: userId }, { $set: { password: newEncreptedPassword } });
        if (passUpdateRes)
            return await userLastPassword.create({ user_id: userId, lastPassword: newPassword });
    }
    else if (count == 2) { return count - 2 }
}

/**
* showAllUser- function to show All User
* @param {*} 
* @returns 
*/
module.exports.showAllUser = async () => {
    return await user.aggregate([
        {
            $lookup: {
                from: "userdeatails",
                localField: "_id",
                foreignField: "user_id",
                as: "userData",
            }
        },
        {
            $unwind: {
                'path': "$userData",
                'preserveNullAndEmptyArrays': true
            }
        },
        {
            $lookup: {
                from: "roles",
                localField: "_id",
                foreignField: "user_id",
                as: "userRoles",
            }
        },
        {
            $unwind: {
                'path': "$userRoles",
                'preserveNullAndEmptyArrays': true
            }
        },
        {
            $project: {
                '_id': 1,
                'firstName': '$userData.firstName',
                'lastName': '$userData.lastName',
                'email': '$userData.email',
                'image': '$userData.image',
                'role': '$userRoles.role_id',
                'isDelete':1



            }
        }, {
            $match: { isDelete: false }
        }
    ]);
}

/**
 * @author - atul singh chauhan
 * @removeUser - Remove remove user
 * @param {*} id
 * @returns 
 */
module.exports.removeUser = async (id) => {//soft delete
    let userDeleteRes = await user.findByIdAndUpdate(id, { isDelete: true });
    if (userDeleteRes) {
        await userDeatail.updateOne({user_id:ObejctID(id)}, {$set:{isDelete: true} });
        await userLastPassword.updateOne({user_id:ObejctID(id)}, {$set:{isDelete: true} });
        await role.updateOne({user_id:ObejctID(id)}, {$set:{isDelete: true} });
    }
    return userDeleteRes;
}

