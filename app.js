require('dotenv').config()
const {App, LogLevel, AwsLambdaReceiver} = require ('@slack/bolt');
const {WebClient} = require ('@slack/web-api')

// Initialize custom AWS Lambda Receiver

const awsLambdaReceiver = new AwsLambdaReceiver({
	signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Initializing the App
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	receiver: awsLambdaReceiver,
	logLevel: LogLevel.DEBUG,
});

// Initilizing client to call API methods directly
const client = new WebClient(process.env.SLACK_BOT_TOKEN, {
	logLevel: LogLevel.DEBUG
});

const TEST_CHANNEL = "C02P26U1E4D"
const WHOS_COMING_CHANNEL = "C02QBKTJL5A"

// LISTENING TO USER ACTIONS ON MESSAGE

app.action('coming_button_action_id', async ({body, client, ack}) =>{
		
		// Acknowledge the action

		await ack();

		// getting data from original message
		let user = body.user.id;
		let newBlocks = body.message.blocks;
		let actionValue = body.actions[0].value;
		let morningWorkersString = newBlocks[2].text.text;
		let morningWorkersArray= morningWorkersString.split(" ")
		let afternoonWorkersString = newBlocks[6].text.text
		let afternoonWorkersArray= afternoonWorkersString.split(" ")

		if(actionValue === "yes-morning" && !morningWorkersArray.includes(`<@${user}>`)){
			// add new present member
		let newString = morningWorkersString.concat(" ",`<@${user}>`);
		newBlocks[2].text.text = newString;
		} else if (actionValue === "yes-afternoon" && !afternoonWorkersArray.includes(`<@${user}>`)){
			// add new present member
		let newString = afternoonWorkersString.concat(" ",`<@${user}>`);
		newBlocks[6].text.text = newString;
		}

		// Updating the original message
		const result = await client.chat.update({
			"channel": body.channel.id,
			"ts": body.container.message_ts,
			"as_user": true,
			"text": "block updated",
			"blocks": newBlocks,
		})

	})

	app.action('not_coming_button_action_id', async ({body, client, ack}) =>{
		// Acknowledge the action

		await ack();

		// retrieving date from original message

		let index, newString;
		let user = body.user.id;
		let newBlocks = body.message.blocks;
		let actionValue = body.actions[0].value;
		let morningWorkersString = newBlocks[2].text.text;
		let morningWorkersArray= morningWorkersString.split(" ")
		let afternoonWorkersString = newBlocks[6].text.text
		let afternoonWorkersArray= afternoonWorkersString.split(" ")

		if (actionValue === "no-morning" && morningWorkersArray.includes(`<@${user}>`)){
			// delete member if declared present
		index = morningWorkersArray.findIndex((element) => element === `<@${user}>`)
		morningWorkersArray.splice(index,1);
		newString = morningWorkersArray.join(" ");
		newBlocks[2].text.text = newString;
		} else if (actionValue === "no-afternoon" && afternoonWorkersArray.includes(`<@${user}>`)){
			// delete member if declared present
			index = afternoonWorkersArray.findIndex((element) => element === `<@${user}>`)
			afternoonWorkersArray.splice(index,1);
			newString = afternoonWorkersArray.join(" ");
			newBlocks[6].text.text = newString;
		};

		// Updating the original message
		const result = await client.chat.update({
			"channel": body.channel.id,
			"ts": body.container.message_ts,
			"as_user": true,
			"text": "block updated",
			"blocks": newBlocks,
		})
	})

// Handle the Lambda function event

module.exports.handler = async (event, context, callback) => {
    const handler = await awsLambdaReceiver.start();
    return handler(event, context, callback);
}