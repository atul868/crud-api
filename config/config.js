const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    port: process.env.PORT,
    databaseURL: process.env.MONGODB_URI,
    development_databaseURL: process.env.DEVELOPMENT_URI,
    secret: process.env.JWT_SECRET
};