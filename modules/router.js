const middleware = require('../middlewares/validation');
const auth = require('../utils/auth');
const hasRole = require('../middlewares/hasRole');
const authCheck = auth.jwt;
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const imageUpload = upload.fields([{ name: "image", maxCount: 10 }]);
const { userSignup, userLogin, updateUserProfile, updatePassword,getAllUser,deleteUser } = require('./controller')

const { signupFormVailidator, loginFormVailidator, updateUserProfileVailidator, updatePasswordVailidator } = require('./vailidator')
/**
 * role 1 = user
 * role 2 = admin 
 * if user will update password then we will take  use_id from auth token and for in admin case we will send user_id with req
 */
module.exports = (app) => {
  app.post('/userSignup', middleware(signupFormVailidator), userSignup);//user signup
  app.post('/userLogin', middleware(loginFormVailidator), userLogin);//user and admin can login with this api
  app.put('/updateUserProfile',imageUpload, authCheck, middleware(updateUserProfileVailidator), hasRole([1,2]), updateUserProfile);//user and admin can use this api for user update
  app.put('/updatePassword', authCheck, middleware(updatePasswordVailidator), hasRole([1,2]), updatePassword);//user and admin can use this api for password update
  app.get('/showUserList', authCheck, hasRole([2]), getAllUser);//after admin login we can hit this api for fetching all user list
  app.delete('/deleteUser/:user_id', authCheck,hasRole([2]), deleteUser);//admin can use for user delete
};