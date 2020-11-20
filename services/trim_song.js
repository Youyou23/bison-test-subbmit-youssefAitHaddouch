'use strict';
const AWS = require('aws-sdk');
const util = require('util');
const ffmpeg = require('ffmpeg');
const fs = require('fs');
const { spawnSync } = require("child_process");
// get reference to S3 client
const s3 = new AWS.S3();

module.exports.trim = async event => {

  try {

        // Read options from the event parameter.
        console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
        const srcBucket = event.Records[0].s3.bucket.name;
        // Object key may have spaces or unicode non-ASCII characters.
        const srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

        // if the destination is the same keep it:
        const dstKey    = "trimmed-version-" + srcKey;
    
        // for temp saving :
        const source_file_path = '/tmp/'+srcKey;
        const trimmed_file_path = '/tmp/'+dstKey;

        // Infer the file type from the file suffix.
        const typeMatch = srcKey.match(/\.([^.]*)$/);
        if (!typeMatch) {
            console.log("Could not determine the media type.");
            return;
        }
    
        // Check that the image type is supported  (mp3) :
        const mediaType = typeMatch[1].toLowerCase();
        if (mediaType != "mp3") {
            console.log(`Unsupported media type: ${mediaType}`);
            return;
        }
    
        // Download the file from the S3 source bucket to /tmp directory.     
        await load_media_into_memory(srcKey,srcBucket,source_file_path);

        console.log('object loaded to memory',source_file_path);

        //trim the file using ffmpeg command  : take the first 5 s.
        console.log('converts file using ffmpeg to:',trimmed_file_path)
        spawnSync(
          "/opt/ffmpeg/ffmpeg",
          [
            "-i",
            source_file_path,
            "-ss",
            "0",
            "-to",
            "5",
            trimmed_file_path
          ],
          { stdio: "inherit" }
        );

        // load trimmed file to s3 
        // add prefix to key so that trimmed versions will be stored within this prefix :
        const s3_destination_key = 'trimmed/'+dstKey;
        await upload_media_to_s3(s3_destination_key,srcBucket,trimmed_file_path);
        

        // remove the original file from S3:
        await s3.deleteObject({ Bucket: srcBucket, Key: srcKey }).promise();
        console.log('file processed with success');
        return;
  } catch (error) {
    console.log(`an error occured durring file processing: ${error}`);
    return;
  }
};

const load_media_into_memory = (media_key,bucket,destination_file) => {

  return new Promise(async (resolve, reject) => {
      const fileStream = fs.createWriteStream(destination_file);
      const s3Stream = s3.getObject({Bucket: bucket, Key: media_key}).createReadStream();

      // Listen for errors returned by the service
      s3Stream.on('error', function(err) {
          // NoSuchKey: The specified key does not exist
          console.error(err);
          reject(err);
          return;
      });

      s3Stream.pipe(fileStream).on('error', function(err) {
          // capture any errors that occur when writing data to the file
          console.error('File Stream:', err);
          reject(err);
          return;
      }).on('close', function() {
          console.log('Done object loaded.',destination_file);
          resolve({});
      });
  });
}

const upload_media_to_s3 = (media_key,bucket,source_file) => {

  return new Promise( async (resolve, reject) =>{
        // call S3 to retrieve upload file to specified bucket
        const uploadParams = {Bucket: bucket, Key: media_key, Body: ''};
        console.log('uploading media to s3 request :', media_key);
        // Configure the file stream and obtain the upload parameters
        var fs = require('fs');
        var fileStream = fs.createReadStream(source_file);
        fileStream.on('error', function(err) {
          console.log('File Error', err);
          reject(err);
          return;
        });
        uploadParams.Body = fileStream;

        // call S3 to retrieve upload file to specified bucket
        s3.upload (uploadParams, function (err, data) {
          if (err) {
            console.log("Error durring uploading trimmed file", err);
            reject(err);
            return;
          } if (data) {
            console.log("Upload Success", data.Location);
            resolve({});
          }
        });
  });
}