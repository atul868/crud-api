const middleware = require('../middlewares/validation');
const auth = require('../utils/auth');
const hasRole = require('../middlewares/hasRole');
const authCheck = auth.jwt;
var fs = require("fs");
const multer = require("multer");
const path = require("path");

var dir = path.resolve("./uploads");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage
});
const { userSignup, userLogin, updateUserProfile, updatePassword, getAllUser, deleteUser, imageUpload } = require('./controller')

const { signupFormVailidator, loginFormVailidator, updateUserProfileVailidator, updatePasswordVailidator } = require('./vailidator')
/**
 * role 1 = user
 * role 2 = admin 
 * if user will update password then we will take  use_id from auth token and for in admin case we will send user_id with req
 */
module.exports = (app) => {
  app.post('/userSignup', middleware(signupFormVailidator), userSignup);//user signup
  app.post('/userLogin', middleware(loginFormVailidator), userLogin);//user and admin can login with this api
  app.put('/updateUserProfile', authCheck, middleware(updateUserProfileVailidator), hasRole([1, 2]), updateUserProfile);//user and admin can use this api for user update
  app.put('/updatePassword', authCheck, middleware(updatePasswordVailidator), hasRole([1, 2]), updatePassword);//user and admin can use this api for password update
  app.get('/showUserList', authCheck, hasRole([2]), getAllUser);//after admin login we can hit this api for fetching all user list
  app.delete('/deleteUser/:user_id', authCheck, hasRole([2]), deleteUser);//admin can use for user delete
  
  app.post("/files", upload.any(), (req, res) => {//this api i am using for uploading image on s3bucket
    let data = {
      files: req.files
    };
    imageUpload(data, res);
  });
};