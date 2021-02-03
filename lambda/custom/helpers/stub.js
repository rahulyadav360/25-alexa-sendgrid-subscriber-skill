

const stub = function () { };


stub.prototype.Subscribe = (email) => {
    return new Promise((resolve, reject) => {
        resolve(`${email} was subscribed`);
    });
}

stub.prototype.Unsubscribe = (email) => {
    return new Promise((resolve, reject) => {
        resolve(`${email} was unsubscribed`);
    });
}

module.exports = new stub();