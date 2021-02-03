var AWS = require("aws-sdk");
AWS.config.update({region: "us-east-1"});
const tableName = "email-subscribers";

var dynamodb = function () { };
var docClient = new AWS.DynamoDB.DocumentClient();

dynamodb.prototype.Subscribe = (userId,listId,email) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: tableName,
            Item: {
              'listId' : listId,
              'userId': userId,
              'email' : email,
              'unsubscribe' : false
            }
        };
        docClient.put(params, (err, data) => {
            if (err) {
                console.log("Unable to insert =>", JSON.stringify(err))
                return reject("Unable to insert");
            }
            console.log("Saved Data, ", JSON.stringify(data));
            resolve(data);
        });
    });
}

dynamodb.prototype.Unsubscribe = (userId,listId,email) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: tableName,
            Item: {
              'listId' : listId,
              'userId': userId,
              'email' : email,
              'unsubscribe' : true
            }
        };
        docClient.put(params, (err, data) => {
            if (err) {
                console.log("Unable to insert =>", JSON.stringify(err))
                return reject("Unable to insert");
            }
            console.log("Saved Data, ", JSON.stringify(data));
            resolve(data);
        });
    });
}

module.exports = new dynamodb();