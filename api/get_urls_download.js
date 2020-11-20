'use strict';
const AWS = require('aws-sdk')
const s3 = new AWS.S3()


// header to allow cors origin:
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
};
module.exports.get = async event => {
  try {

    // get the bucket name and expiration values from process:
    const BUCKET_NAME = process.env.BUCKET_NAME
    const EXPIRY_TIME = process.env.URL_EXPIRATION_TIME

    //prefix for trimmed versions of files:
    const prefix = 'trimmed'

    const presignedURLSData = await getPresingedUrlsTrimmedAudio(BUCKET_NAME,EXPIRY_TIME,prefix);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message : "success",
        song_urls : presignedURLSData
        
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
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

const getPresingedUrlsTrimmedAudio = (bucket,expiration_time,prefix) => {

  return new Promise(async (resolve, reject) => {
    const lis_presigned_urls = [];
    
    const params = {
      Bucket : bucket,
      Prefix : prefix
    }
    
    // Call S3 to obtain a list of the objects in the bucket
    s3.listObjects(params, function(err, data) {
      if (err) {
        console.log("Error", err);
        reject(err);
        return;
      } else {
        console.log("Success", data);

        // get contents info array
        const listObjects = data.Contents;

        // loop through keys and generate presigned URLs :
        for(var item of listObjects) {
          console.log('item fetched: ', item.Key);
          const presigned_object = {};

          //issue within this version of s3 SDK :
          const expiry_time = Number(expiration_time)   
          // get presigned URL for the key : 
          const presigned_url =  s3.getSignedUrl('getObject',{
            Bucket: params.Bucket,
            Key: item.Key,
            Expires: expiry_time
          });

          presigned_object.Key = item.Key;
          presigned_object.presigned_url = presigned_url;
          lis_presigned_urls.push(presigned_object)
        }

        resolve(lis_presigned_urls);
      }
    });
  });
};
