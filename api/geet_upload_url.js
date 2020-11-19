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

  const responseBody = {};
  const statusCode = 200;
  

  try {

    const requestBody =  JSON.parse(event.body);

    // get file name from request
    const file_name = requestBody.file_name;

    // generate unique_key :
    const unique_key = uniqid()+'_'+file_name;

    const presignedPostData = await createPresignedPost({
      key: unique_key
    });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        error: false,
        data: presignedPostData,
        message: null
      })
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
    Expires: 60*10,
    Bucket: "test-bison-media-files-youssefhaddouch",
    Fields: {
      key  : file_params.key
    }
  };
  return new Promise(async (resolve, reject) => {
    s3.createPresignedPost(params, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
};


