'use strict';

const AWS = require('aws-sdk');
const BUCKET = 'api-import-service';

module.exports.importProductsFile = async (event) => {
    try {
      const { name } = event.queryStringParameters;
      const key = `uploaded/${name}`;
      
      const params = {
        Bucket: BUCKET,
        Key: key,
      };
  
      const s3 = new AWS.S3();
      const signedUrl = s3.getSignedUrl('putObject', params);
  
      return {
        statusCode: 200,
        body: JSON.stringify({ signedUrl }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'URL can not be generated' }),
      };
    }
  };