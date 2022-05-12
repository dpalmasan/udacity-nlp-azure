# Project: Dental Office Virtual Assistant

Project description goes here.

## Getting Started

First you need to create the required resources in Azure, in this case an `Azure Bot` with type `MultiTenant` in your resource group. Then, you need to get your `MicrosoftAppId` and `MicrosoftAppPassword`. You can get these credentials from the deployment info, or you can go to registered apps and create a new secret for your client (App id). On the other hand, you need to to create a `QnA` service and a `LUIS` service, and get your credentials for both. I am not providing my credentials due to security reasons, and for deployments I am using Github secrets.

To run de bot (assuming you are at the root directory of this repo):

```
cd starter/ContosoDentistryChatBot/ \
    && npm install \
    && npm start
```

To test your bot locally, you may want to use the Bot Framework Emulator, and make it point to `localhost:<PORT>/api/messages`. Add your credentials as well.

### Dependencies

```json
{
    "dependencies": {
        "botbuilder": "~4.16.0",
        "botbuilder-ai": "~4.16.0",
        "dotenv": "~8.2.0",
        "restify": "~8.5.1"
    }
}
```

### Installation

To install the scheduler or the bot, go to their respective directory and run:

```
npm install
```

There is an example provided above.

## Testing

I wrote no tests for this app as it is small, but as a proposal we could run automated integration tests with the bot framework emulator (e.g. using Selenium).

## Project Instructions

All the requested screenshots are in the `deliverables` folder. Also you might want to try the [web app with the bot embedded](https://lively-sand-0055d8e10.1.azurestaticapps.net).

## Built With

* [LUIS](luis.ai) - Language Understanding module, used to capture intents in the user chat: `getAvailability` or `scheduleAppointment`
* [QnA](qnamaker.ai) - Question and Answer service, to answer possible user queries.
* [Dentistry Chatbot](https://lively-sand-0055d8e10.1.azurestaticapps.net) - Built with node and Azure cognitive services.

Include all items used to build project.

## License

[License](LICENSE)

## Personal Notes (to not forget)

Since this project has multiple workspaces, it can be a monorepo. I would be a good idea in the future to use `lerna` to manage the project.
