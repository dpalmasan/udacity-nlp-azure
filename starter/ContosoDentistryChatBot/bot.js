// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

const { QnAMaker } = require('botbuilder-ai');
const DentistScheduler = require('./dentistscheduler');
const IntentRecognizer = require("./intentrecognizer")

class DentaBot extends ActivityHandler {
  constructor(configuration, qnaOptions) {
    // call the parent constructor
    super();
    if (!configuration) throw new Error('[QnaMakerBot]: Missing parameter. configuration is required');

    // create a QnAMaker connector
    this.QnAMaker = new QnAMaker(configuration.QnAConfiguration);

    // create a DentistScheduler connector
    this.DentistScheduler = new DentistScheduler(configuration.SchedulerConfiguration);

    // create a IntentRecognizer connector
    this.IntentRecognizer = new IntentRecognizer(configuration.LuisConfiguration);


    this.onMessage(async (context, next) => {
      // send user input to QnA Maker and collect the response in a variable
      // don't forget to use the 'await' keyword

      // send user input to IntentRecognizer and collect the response in a variable
      // don't forget 'await'

      // determine which service to respond with based on the results from LUIS //

      // if(top intent is intentA and confidence greater than 50){
      //  doSomething();
      //  await context.sendActivity();
      //  await next();
      //  return;
      // }
      // else {...}
      const answers = await this.QnAMaker.getAnswers(context);
      const result = await this.IntentRecognizer.executeLuisQuery(context);
      const topIntent = result.luisResult.prediction.topIntent;
      let message;
      if (result.intents[topIntent].score > 0.65) {
        if (topIntent === 'getAvailability') {
          message = await this.DentistScheduler.getAvailability();
        } else {
          message = await this.DentistScheduler.scheduleAppointment(
            this.IntentRecognizer.getTimeEntity(result));
        };
      } else {
        message = answers[0].answer;
      }
      await context.sendActivity(MessageFactory.text(message, message));
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      //write a custom greeting
      const welcomeText = 'Welcome! I am Contoso DentBot, nice to meet you.\n\n'
        + 'I can answer questions regarding the Contoso Dental Office. Moreover '
        + 'I know all the matters related to appointments, such as providing '
        + 'available times and scheduling an appointment for you!\n\n'
        + 'What can I do for you today?'
      for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
        if (membersAdded[cnt].id !== context.activity.recipient.id) {
          await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
        }
      }
      // by calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }
}

module.exports.DentaBot = DentaBot;
