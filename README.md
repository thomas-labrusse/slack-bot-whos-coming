# Slack bot Who's coming

Slack bot that allows users to notify if they are coming to a coworking space on a given day.

The bot post a daily message on a dedicated channel and listen to members inputs.

Deployed with AWS Lambda & Serverless, following this [Slack Bolt guide](https://slack.dev/bolt-js/deployments/aws-lambda).

## Setup

To get started, clone this repository.

```
git clone https://github.com/thomas-labrusse/slack-bot-whos-coming.git
```

### Creating a Slack App

To post a message in a Slack workspace, and to listen to incoming events from that workspace, Slack client requires you to create a new App.

This bot has been created using the Bolt framework for Slack, and following the lines of [this guide](https://slack.dev/bolt-js/tutorial/getting-started).

### Tokens

When your Slack app is created include your Bot User OAuth Token and your Signing Secret in a `.env` file.

```
SLACK_BOT_TOKEN=<your token>
SLACK_SIGNING_SECRET=<your secret>
```

### Scope and permission

In your App dashboard allow your app to write message in public chats, and to listen to new messages :

OAuth & Permissions/Scopes --> Add the following scopes :
`chat:write`
`channels:history`

Subscribe to events :

Event Subscriptions/Subscribe to bot events --> Add bot user event :
`message.channels`

## Modifying the automatic message schedule

Daily messages are sent daily using the AWS/Serverless scheduling functionnality.

To change the schedule, modify the `schedule/rate` in the `serverless.yml` file using cron syntax.
