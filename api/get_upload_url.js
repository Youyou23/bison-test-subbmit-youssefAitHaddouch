'use strict';
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const uniqid = require("uniqid");


// header to allow cors origin:
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
};



module.exports.get = async event => {

  try {

    //get the bucket name from process.env
    const BUCKET_NAME = process.env.BUCKET_NAME

    //get expiration duration for signed URL
    const EXPIRY_TIME = process.env.URL_EXPIRATION_TIME

    
    // generate key to use in sign request :
    const unique_key = uniqid()+'.mp3';

    const presignedPostData = await createPresignedPost({
      key: unique_key,
      bucket: BUCKET_NAME,
      exiry_date :EXPIRY_TIME
    });
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(presignedPostData)
    };

  } catch (error) {
    console.log('Error durring generating presigned url:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: true,
        data: null,
        message: error.message
      })
    };
  }
};

const createPresignedPost = (file_params) => {
  const params = {
    Expires: file_params.exiry_date,
    Bucket: file_params.bucket,
    Fields: {
      key  : file_params.key
    }
  };
  return new Promise(async (resolve, reject) => {

    // get presigned Post DATA:
    s3.createPresignedPost(params, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
};


