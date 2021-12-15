require('dotenv').config()
// var CronJob = require('cron').CronJob;
const {App, LogLevel, AwsLambdaReceiver} = require ('@slack/bolt');
const {WebClient} = require ('@slack/web-api')

const QUOTES = require('./citations.json');

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

// --------------- Cron job test ---------------

// var job = new CronJob(
// 	// * * * * 1-4,7
// 	// "*/3 * * * *",
// 	"*/2 * * * *",
// 	function() {
// 	whosComingMessage();
// 	console.log("Cron onTick function triggered");
// 	},
// 	null,
// );

// job.start();

// --------------- TEST PURPOSE ONLY ---------------

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {

	console.log('ENV VARIABLE FROM HELLO', process.env.SLACK_BOT_TOKEN)
	console.log('SLACK WEBHOOK', process.env.SLACK_WEBHOOK)
	console.log('SLACK TEST', process.env.SLACK_TEST)
	console.log('SLACK SIGNING', process.env.SLACK_SIGNING_SECRET)
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `Hey there <@${message.user}>!`
  });
});

// Listens for an action from a button click
app.action('button_click', async ({ body, ack, say }) => {
  await ack();
  
  await say(`<@${body.user.id}> clicked the button`);
});

// --------------- WHO'S COMING LOGIC ---------------

const whosComingMessage= async () => {

	// CRON next dates
	// console.log("Next job time:", job.nextDates().toISOString());

	// displaying tomorrow date

	let today = new Date();
	let tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate()+1);
	var options = {weekday: "long", year: "numeric", month: "long", day: "numeric"}
	let date = tomorrow.toLocaleDateString("fr-FR", options)

	// picking a random motivational quote
	function getRandomIntInclusive(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min +1)) + min;
	}
	let randomIndex = getRandomIntInclusive(0, QUOTES.length)

	console.log(randomIndex);

	let randomQuote = QUOTES[randomIndex].citation;
	let quoteAuthor = QUOTES[randomIndex].author;

	try {
	await client.chat.postMessage({
	"channel": WHOS_COMING_CHANNEL,
	// Find better fallback message !!!
	"text": "fallback message",
	"blocks": [
		{
			"type": "header",
			"text": {
				"type": "plain_text",
				"text": `:calendar:|  Tu viens au Poool le ${date} ?  |:calendar:`,
				"emoji": true
			}
		},
		{
			"type": "section",
			"text":
				{
					"type": "plain_text",
					"text": ":sunrise: Elles/Ils y seront le matin, et toi ?",
					"emoji": true
				}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": " "
			}
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Oui"
					},
					"style": "primary",
					"value": "yes-morning",
					"action_id": "coming_button_action_id"
				},
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Non"
					},
					"style": "danger",
					"value": "no-morning",
					"action_id": "not_coming_button_action_id"
				}
			]
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text":
				{
					"type": "plain_text",
					"text": ":sunny: Elles/Ils y seront l'après-midi, et toi ?",
					"emoji": true
				}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": " "
			}
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Oui"
					},
					"style": "primary",
					"value": "yes-afternoon",
					"action_id": "coming_button_action_id"
				},
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"emoji": true,
						"text": "Non"
					},
					"style": "danger",
					"value": "no-afternoon",
					"action_id": "not_coming_button_action_id"
				}
			]
		},
		{
			"type": "divider"
				},
				{
			"type": "context",
			"elements": [
				{
					"type": "mrkdwn",
					"text": `:bulb: _"${randomQuote}"_ - *${quoteAuthor}*`
				}
			]
		}
	]
})
	} catch (error) {
		console.error(error)
	}

	
};

// TEST MOVING ACTION OUTSIDE OF MESSAGE FUNCTION

app.action('coming_button_action_id', async ({body, ack}) =>{
		
		// Acknowledge the action

		console.log("REACHES HERE")

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
			"text": "block updated",
			"blocks": newBlocks,
		})

	})

	app.action('not_coming_button_action_id', async ({body, ack}) =>{
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
			"text": "block updated",
			"blocks": newBlocks,
		})
	})


// --------------- STARTING THE APP ---------------

// Handle the Lambda function event

module.exports.handler = async (event, context, callback) => {
    const handler = await awsLambdaReceiver.start();
    return handler(event, context, callback);
}