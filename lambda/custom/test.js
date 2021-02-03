const config = require('./config');
const dbHelper = require('./helpers/sendgrid');


const date = new Date();

const email = 'steve+test@dabblelab.com';

dbHelper.DeleteGlobalSupression(email)
  .then(result => {
    console.log(result.toString());
    dbHelper.Subscribe(email)
      .then(result => {
        console.log(`Finished subscribing: ${email}`);
        console.log(result);
      });
  })
  .catch(err => {
    console.log(err.toString());
  })

// dbHelper.Unsubscribe(email)
//   .then(result => {
//     console.log(`Unsubscribed: ${email}`)
//   })