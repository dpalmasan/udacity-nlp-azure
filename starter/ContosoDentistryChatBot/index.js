// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const path = require('path');

const dotenv = require('dotenv');
// Import required bot configuration.
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

const restify = require('restify');

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
const {
  ConfigurationServiceClientCredentialFactory,
  createBotFrameworkAuthenticationFromConfiguration,
  BotAdapter,
  CloudAdapter
} = require('botbuilder');

// This bot's main dialog.
const { DentaBot } = require('./bot');

// Create HTTP server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\n${server.name} listening to ${server.url}`);
  console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
  console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MICROSOFTAPPID,
  MicrosoftAppPassword: process.env.MICROSOFTAPPPASSWORD,
  MicrosoftAppType: process.env.MICROSOFTAPPTYPE,
  MicrosoftAppTenantId: process.env.MICROSOFTAPPTENANTID
});

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about how bots work.
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Catch-all for errors.
const onTurnErrorHandler = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity(
    'OnTurnError Trace',
    `${error}`,
    'https://www.botframework.com/schemas/error',
    'TurnError'
  );

  // Send a message to the user
  await context.sendActivity('The bot encountered an error or bug.');
  await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

// Set the onTurnError for the singleton BotFrameworkAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Map configuration values values from .env file into the required format for each service.
const QnAConfiguration = {
  knowledgeBaseId: process.env.QNAKNOWLEDGEBASEID,
  endpointKey: process.env.QNAAUTHKEY,
  host: process.env.QNAENDPOINTHOSTNAME
};

const LuisConfiguration = {
  applicationId: process.env.LUISAPPID,
  endpointKey: process.env.LUISAPIKEY,
  endpoint: process.env.LUISAPIHOSTNAME,
}

const SchedulerConfiguration = {
  SchedulerEndpoint: process.env.SCHEDULERENDPOINT
}
//pack each service configuration into 
const configuration = {
  QnAConfiguration,
  LuisConfiguration,
  SchedulerConfiguration
}

// Create the main dialog.
const myBot = new DentaBot(configuration, {});

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    // Route to main dialog.
    await myBot.run(context);
  });
});

server.get('/', (req, res) => {
  res.json({
    'message': 'Hello world!',
  })
});

// Listen for Upgrade requests for Streaming.
server.on('upgrade', (req, socket, head) => {
  // Create an adapter scoped to this WebSocket connection to allow storing session data.
  const streamingAdapter = new CloudAdapter(botFrameworkAuthentication);
  // Set onTurnError for the BotFrameworkAdapter created for each connection.
  streamingAdapter.onTurnError = onTurnErrorHandler;

  streamingAdapter.useWebSocket(req, socket, head, async (context) => {
    // After connecting via WebSocket, run this logic for every request sent over
    // the WebSocket connection.
    await myBot.run(context);
  });
});
