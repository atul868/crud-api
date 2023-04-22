const AWS = require('aws-sdk');
const fs = require('fs');

const config = require('./config');

const s3bucket = new AWS.S3({
    accessKeyId: config.awsAccessKey,
    secretAccessKey: config.awsSecretKey,
    Bucket: config.awsTemplateBucket,
});
console.log(s3bucket);
const handleAWSUpload = async (file, uploadPath) => {
    return new Promise(function (resolve, reject) {
        try {
            fs.readFile(file.path, async function (err, data) {
                if (err) {
                    return reject(err);
                }
                const params = {
                    Bucket: config.awsTemplateBucket,
                    Key: uploadPath ? uploadPath : (file.originalname + "_" + Date.now()),
                    Body: data,
                    ContentType: file.mimetype,
                    ACL: 'public-read'
                };
                try {
                    const uploadDetails = await s3bucket.upload(params).promise();
                    return resolve(uploadDetails.Location);
                } catch (err) {
                    console.log(err);
                    return reject(err);
                }
            })
        } catch (err) {
            return reject(err);
        }

    });
}

module.exports = {
    handleAWSUpload,
    s3bucket
}