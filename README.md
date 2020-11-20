### Dependencies

* node js, npm, sls
* Amazon CLI installed and configured with AWS account

### Installing

```
npm install
```

### deployment of all the resources required via sls :  

* please before deploying to AWS, change the bucket name in config.dev.json

```
sls deploy
```

## APIs end points :

API get_upload_url :
```
https://w8ypgk5shf.execute-api.us-east-1.amazonaws.com/dev/get_upload_url
```
Please note that this API return the signed URL in form-data for post request, to be able to test the upload  without manually copy/paste this values, the exported collection contains the Post request sample populated with data from environment, wich updated every time this API(get_upload_url) is called, and it's also required to add an mp3 file in the key 'file' 


API get_song_urls :
```
https://w8ypgk5shf.execute-api.us-east-1.amazonaws.com/dev/get_song_urls
```

## Postmane collection & environement
Postman Collection :  
```
https://www.getpostman.com/collections/141fdd3b68f8c6e3db23
```

Postman Environemet (required for upload file API testing) : postman_environement_export.json
