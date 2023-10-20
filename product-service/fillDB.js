const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1'});
const dynamodb = new AWS.DynamoDB.DocumentClient();

//Add product to products
const addProduct = async(id, title, description, price) => {
    const params = {
        TableName: 'products',
        Item: {
            id,
            title,
            description,
            price
        }
    };
    return dynamodb.put(params).promise();
}

//Add stock to stocks
const addStock = async(product_id, count) => {
    const params = {
        TableName: 'stocks',
        Item: {
            product_id,
            count
        }
    };
    return dynamodb.put(params).promise();
}

//Data
(async () => {
    try {
        await addProduct(1, 'Gummy bears', 'Gummy bears bag', 12);
        await addProduct(2, 'Chocolate bars', 'Bar 100g', 18);
        await addProduct(3, 'Gelly', 'Gelly 500g', 30);

        await addStock(1, 50);
        await addStock(2, 20);
        await addStock(3, 5);

        console.log('Data added successfully');
    } catch(error) {
        console.error('Data could not be added: ', error)
    }
})();
