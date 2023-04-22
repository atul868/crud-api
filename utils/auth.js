const jwt = require('jsonwebtoken');
const config = require('../config/config');
const {employee} = require('../modules/schema');
const bcrypt = require('bcrypt');
const { getUser } = require('../modules/dbQuery');

exports.generateToken = function (user) {
  const empData = {
    userId: user,
  };
  return jwt.sign(empData, config.secret, {
    expiresIn: 8640000, // expires in 2400 hours 100 days
  });
};

exports.jwt = function (req, res, next) {
  const token = req.headers['authorization'];
  const result = token ? token.substr(token.indexOf(' ') + 1) : false;
  if (!result) {
    return res.status(403).send({ 'status': false, 'code': 403, 'message': 'Unauthorized !' });
  }
  jwt.verify(result, config.secret, async function (err, decoded) {

    if (decoded) {
      var userExist = await getUser(decoded.userId.userId);
      // console.log('userExist==>',userExist[0]._id);
    }

    if (err) {
      return res.status(500).send({ 'status': false, 'code': 500, 'message': 'Failed to authenticate token. !' });
    }
    if (userExist) {
      req.user = userExist;
      return next();
    }
  });
};

exports.hashPasswordUsingBcrypt = function (plainTextPassword) {
  try {
    return bcrypt.hashSync(plainTextPassword, 10);
  } catch (error) {
    throw error;
  }
};
