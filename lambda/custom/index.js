/* eslint-disable no-console */
const Alexa = require('ask-sdk');
const config = require('./config');
const dbHelper = require('./helpers/sendgrid');

const messages = {
  NOTIFY_MISSING_PERMISSIONS: 'This skill needs access to your email address. Please allow access using the Amazon Alexa app or through alexa.amazon.com, then try again.',
  ERROR: 'Uh Oh. Looks like something went wrong.',
};

const EMAIL_PERMISSION = 'alexa::profile:email:read';
// const FULL_NAME_PERMISSION = "alexa::profile:name:read";
// const MOBILE_PERMISSION = "alexa::profile:mobile_number:read";

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = `Hello. Welcome to the ${config.appName} email subscription manager . You can say subscribe to opt in to the ${config.appName} email list. Or, to opt out - just say: unsubscribe.`;
    const reprompt = `Say; subscribe to opt in to the ${config.appName} email list - or say: unsubscribe to opt out.`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(reprompt)
      .getResponse();
  },
};

const SubscribeIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'SubscribeIntent';
  },
  async handle(handlerInput) {
    const { serviceClientFactory, responseBuilder } = handlerInput;
    try {
      // const userID = handlerInput.requestEnvelope.context.System.user.userId;
      const upsServiceClient = serviceClientFactory.getUpsServiceClient();
      const profileEmail = await upsServiceClient.getProfileEmail();
      // const profileName = await upsServiceClient.getProfileName();

      if (!profileEmail) {
        const noEmailResponse = 'It looks like I don\'t have your email address. You can set your email from the Alexa companion app or at alexa.amazon.com.';
        return responseBuilder
          .speak(noEmailResponse)
          .getResponse();
      }

      await dbHelper.DeleteGlobalSupression(profileEmail);

      return dbHelper.Subscribe(profileEmail)
        .then(() => {
          const speechText = `Okay, I'll add  ${profileEmail} to the ${config.appName} email list. If you ever want to unsubscribe, just say: Alexa, tell ${config.appName} to unsubscribe me.`;
          return responseBuilder
            .speak(speechText)
            .getResponse();
        })
        .catch((err) => {
          console.log(`Error while calling Subscribe for ${profileEmail}`, err);
          const speechText = `Sorry. There was a problem and I could not add  ${profileEmail} to the ${config.appName} email list. Please try again later.`;
          return responseBuilder
            .speak(speechText)
            .getResponse();
        });
    } catch (error) {
      console.log(JSON.stringify(error));
      if (error.statusCode === 403) {
        return responseBuilder
          .speak(messages.NOTIFY_MISSING_PERMISSIONS)
          .withAskForPermissionsConsentCard([EMAIL_PERMISSION])
          .getResponse();
      }
      console.log(JSON.stringify(error));
      const response = responseBuilder.speak(messages.ERROR).getResponse();
      return response;
    }
  },
};

const UnsubscribeIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'UnsubscribeIntent';
  },
  async handle(handlerInput) {
    const { serviceClientFactory, responseBuilder } = handlerInput;
    try {
      // const userID = handlerInput.requestEnvelope.context.System.user.userId;
      const upsServiceClient = serviceClientFactory.getUpsServiceClient();
      const profileEmail = await upsServiceClient.getProfileEmail();
      // const profileName = await upsServiceClient.getProfileName();

      if (!profileEmail) {
        const noEmailResponse = 'It looks like I don\'t have your email address. You can set your email from the Alexa companion app or at alexa.amazon.com.';
        return responseBuilder
          .speak(noEmailResponse)
          .getResponse();
      }

      return dbHelper.Unsubscribe(profileEmail)
        .then(() => {
          const speechText = `Okay, I've removed  ${profileEmail} from the ${config.appName} email list. If you ever want to subscribe again, just say: Alexa, tell ${config.appName} to opt me in.`;
          return responseBuilder
            .speak(speechText)
            .getResponse();
        })
        .catch((err) => {
          console.log(`Error while calling Unsubscribe for ${profileEmail}`, err);
          const speechText = `Sorry. There was a problem and I could not remove  ${profileEmail} from the ${config.appName} email list. Please try again later or email ${config.supportEmail}.`;
          return responseBuilder
            .speak(speechText)
            .getResponse();
        });
    } catch (error) {
      console.log(JSON.stringify(error));
      if (error.statusCode === 403) {
        return responseBuilder
          .speak(messages.NOTIFY_MISSING_PERMISSIONS)
          .withAskForPermissionsConsentCard([EMAIL_PERMISSION])
          .getResponse();
      }
      console.log(JSON.stringify(error));
      const response = responseBuilder.speak(messages.ERROR).getResponse();
      return response;
    }
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
      || handlerInput.requestEnvelope.request.intent.name === 'RandomIntent');
  },
  handle(handlerInput) {
    const speechText = `You can say: 'subscribe' to opt in to the ${config.appName} email list. Or, 'un-subscribe' to be removed from the list.`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I didn\'t understand that. Could you please say it again?')
      .reprompt('Could you please say that again? I didn\'t understand.')
      .getResponse();
  },
};

const RequestLog = {
  process(handlerInput) {
    console.log(`REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`);
  },
};

const ResponseLog = {
  process(handlerInput) {
    console.log(`RESPONSE BUILDER = ${JSON.stringify(handlerInput)}`);
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    SubscribeIntentHandler,
    UnsubscribeIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addRequestInterceptors(RequestLog)
  .addResponseInterceptors(ResponseLog)
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
