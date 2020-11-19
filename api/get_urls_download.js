'use strict';

module.exports.get = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'hello from function for downloading URLs for objects from S3!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
