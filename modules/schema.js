const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        userName: { type: String },
        password: { type: String },
        isDelete: { type: Boolean, default: false },
    }, { timestamps: true }
);
const userDeatailSchema = new Schema(
    {
        user_id:{ type: Schema.Types.ObjectId, ref: 'user' },
        firstName: { type: String },
        lastName: { type: String },
        email: { type: String },
        image: { type: String },
        isDelete: { type: Boolean, default: false },
    }, { timestamps: true }
);

const roleSchema = new Schema(
    {
        user_id:{ type: Schema.Types.ObjectId, ref: 'user' },
        role_id:{type:Number,default: 1},//user: 1, admin: 2
        isDelete: { type: Boolean, default: false },
    }, { timestamps: true }
);

const  userLastPasswordSchema = new Schema(
    {
        user_id:{ type: Schema.Types.ObjectId, ref: 'user' },
        lastPassword: { type: String },
        isDelete: { type: Boolean, default: false },
    }, { timestamps: true }
);
const user = mongoose.model("user", userSchema);
const userDeatail = mongoose.model("userDeatail", userDeatailSchema);
const role = mongoose.model("role", roleSchema);
const userLastPassword = mongoose.model("userLastPassword", userLastPasswordSchema);
module.exports = { user, userDeatail,role,userLastPassword}



