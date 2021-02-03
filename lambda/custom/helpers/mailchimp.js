const mailchimp = function () { };


mailchimp.prototype.Subscribe = (email) => {
    return new Promise((resolve, reject) => {
        resolve(`${email} was subscribed`);
    });
}

mailchimp.prototype.Unsubscribe = (email) => {
    return new Promise((resolve, reject) => {
        resolve(`${email} was unsubscribed`);
    });
}

module.exports = new mailchimp();