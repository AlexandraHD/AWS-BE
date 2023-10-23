'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.getProductsList = async (event) => {
  try {
    const products = await dynamoDb.scan({ TableName: 'products' }).promise();

    const stocks = await dynamoDb.scan({ TableName: 'stocks' }).promise();

    const productData = products.Items.map((product) => {
      const stockData = stocks.Items.find((stock) => stock.product_id === product.id);
      return {
        ...product,
        stock: stockData ? stockData.count : 0,
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(productData),
    };
  } catch(error) {
    return {
      statusCode: 500,
      body: JSON.stringify({error: 'Error trying to get the products list'}),
    };
  }
};

module.exports.getProductsById = async (event) => {
  const productId = parseInt(event.pathParameters.productId);
  try { 
    const product = await dynamoDb.get({
      TableName: 'products',
      Key: {
        id: productId
      },
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(product.Item),
    };
  } catch(error){
    return {
      statusCode: 500,
      body: JSON.stringify({error: 'Error'}),
    };
  }
};

module.exports.createProduct = async(event) => {
  try {
    const productEx = {
      id: 5,
      title: 'Lollipop',
      description: 'Lollipop bag 300g',
      price: 39,
    }

    //Save data
    const params = {
      TableName: process.env.TABLE_NAME,
      Item: productEx,
    };

    await dynamoDb.put(params).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({message: 'Product saved'})
    };
  } catch(error) {
    return {
      statusCode: 500,
      body: JSON.stringify({message: 'Product was not created'})
    };
  }
};

module.exports.catalogBatchProcess = async (event) => {
  try {
    const { Records } = event;

    for(const record of Records){
      const body = JSON.parse(record.body);
      const producParams = {
        TableName: 'products',
        Item: {
          id: body.id,
          title: body.title,
          description: body.description,
          price: body.price,
        }
      }
      await dynamoDb.put(producParams).promise();

      const snsParams = {
        Message: JSON.stringify({
          message: 'New product created',
          product: body,
        }),
        TopicArn: 'arn:aws:sns:us-east-1:493521690512:createProductTopic'
      };
      await sns.publish(snsParams).promise();

      const sqs = new AWS.SQS();
      await sqs.deleteMessage({
        QueueUrl: 'https://sqs.us-east-1.amazonaws.com/493521690512/catalogItemsQueue',
        ReceiptHandle: record.receiptHandle,
      }).promise();
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify ({
        message: 'Products successfully added',
      })
    };

  } catch(error) {
    return {
      statusCode:500,
      body: JSON.stringify ({
        message: 'products could not be added',
      })
    }
  }
};