const config = require('../config.js');
const https = require("https");

const sendgrid = function () { };

sendgrid.prototype.Subscribe = (email) => {
    return new Promise((resolve, reject) => {
        const date = new Date();
        let contact = {
            "list_ids": config.sendgrid.listIds,
            "contacts": [
                {
                    "address_line_1": undefined,
                    "address_line_2": undefined,
                    "alternate_emails": [],
                    "city": undefined,
                    "country": undefined,
                    "email": email,
                    "first_name": undefined,
                    "id": undefined,
                    "last_name": undefined,
                    "postal_code": undefined,
                    "state_province_region": undefined,
                    "custom_fields": {
                        "e2_D": date.toISOString(), //first_date
                        "e1_T": "alexa-skill", //source
                        "e3_T": undefined, //twitter
                        "e4_T": undefined, //membership_type
                        "e5_T": undefined //membership_status     
                    }
                }
            ]
        }

        const options = {
            "method": "PUT",
            "hostname": "api.sendgrid.com",
            "port": null,
            "path": "/v3/marketing/contacts",
            "headers": {
                "authorization": `Bearer ${config.sendgrid.apiKey}`
            }
        };

        const req = https.request(options, function (res) {
            let chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                const body = Buffer.concat(chunks);
                console.log(body.toString());
                resolve(body.toString());
            });
        });

        req.write(JSON.stringify(contact));
        req.end();
    });
}

sendgrid.prototype.Unsubscribe = (email) => {

    return new Promise((resolve, reject) => {

        const body = {recipient_emails : [email]};

        const options = {
            "method": "POST",
            "hostname": "api.sendgrid.com",
            "port": null,
            "path": "/v3/asm/suppressions/global",
            "headers": {
                "authorization": `Bearer ${config.sendgrid.apiKey}`
            }
        };

        const req = https.request(options, function (res) {
            let chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                const body = Buffer.concat(chunks);
                console.log(body.toString());
                resolve(body.toString());
            });
        });

        req.write(JSON.stringify(body));
        req.end();
    });
}

sendgrid.prototype.DeleteGlobalSupression = (email) => {

    return new Promise((resolve, reject) => {

        const recipient_emails = [email];

        const options = {
            "method": "DELETE",
            "hostname": "api.sendgrid.com",
            "port": null,
            "path": `/v3/asm/suppressions/global/${email}`,
            "headers": {
                "authorization": `Bearer ${config.sendgrid.apiKey}`
            }
        };

        const req = https.request(options, function (res) {
            let chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                const body = Buffer.concat(chunks);
                console.log(`statusCode: ${res.statusCode}`);
                console.log(`body: ${body.toString()}`);
                resolve(body.toString());
            });
        });

        req.write(JSON.stringify(recipient_emails));
        req.end();
    });
}

sendgrid.prototype.getContactByPrimaryEmail = (primaryEmail) => {
    return new Promise((resolve, reject) => {

        var options = {
            "method": "POST",
            "hostname": "api.sendgrid.com",
            "port": null,
            "path": "/v3/marketing/contacts/search",
            "headers": {
                "authorization": `Bearer ${config.sendgrid.apiKey}`,
                "content-type": "application/json"
            }
        };

        const request = https.request(options, (response) => {

            if (response.statusCode < 200 || response.statusCode > 299) {
                reject(new Error('Failed to load page, status code: ' + response.statusCode));
            }

            const body = [];

            response.on('data', (chunk) => body.push(chunk));
            response.on('end', () => resolve(body.join('')));
        });

        request.on('error', (err) => reject(err))

        request.write(JSON.stringify({
            "contacts": `primary_email LIKE '${primaryEmail}%'`
        }));
        request.end();
    });
};

module.exports = new sendgrid();