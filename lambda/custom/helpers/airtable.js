const airtable = function () { };


airtable.prototype.Subscribe = (email) => {
    return new Promise((resolve, reject) => {
        resolve(`${email} was subscribed`);
    });
}

airtable.prototype.Unsubscribe = (email) => {
    return new Promise((resolve, reject) => {
        resolve(`${email} was unsubscribed`);
    });
}

module.exports = new airtable();