'use strict';

const AWS = require('aws-sdk');
const BUCKET = 'api-import-service';
const cvs = require('csv-parser');

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

  module.exports.importProductsFile = async (event) => {
    const s3 = new AWS.S3({ region: 'us-east-1' })
    try {
      for (const record of event.Records) {
        const srcKey = record.s3.object.key;
        const params = {
          Bucket: BUCKET,
          Key: srcKey,
        };
  
        const s3Stream = s3.getObject(params).createReadStream();
  
        s3Stream
          .pipe(csv())
          .on('data', (data) => {
            console.log('CSV Record:', data);
          })
          .on('end', () => {
            console.log('CSV parsing finished.');
          });
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({ error: 'CSV parsing finished' }),
      }

    } catch (error) {
      console.error('Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'CSV parsing failed' }),
      }
    }
  };