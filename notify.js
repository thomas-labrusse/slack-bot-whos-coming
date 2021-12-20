require('dotenv').config();
const{LogLevel} = require ('@slack/bolt');
const {WebClient} = require ('@slack/web-api');
// const axios = require('axios').default;


const QUOTES = require('./citations.json');

const WHOS_COMING_CHANNEL = "C02QBKTJL5A"

// CRON
// Du dimanche au jeudi à 11h du matin
// cron(0 11 ? * 1-5 *)


// Initilizing client to call API methods directly
const client = new WebClient(process.env.SLACK_BOT_TOKEN, {
	logLevel: LogLevel.DEBUG
});

// ----- AUTOMATIC MESSAGE ----------
// Trigger dates can be monitored in AWS CloudWatch / Events / Rules

module.exports.sendMessage = () => {


	// displaying tomorrow date

	let today = new Date();
	let tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate()+1);
	var options = {weekday: "long", year: "numeric", month: "long", day: "numeric"}
	let date = tomorrow.toLocaleDateString("fr-FR", options)

	// // picking a random motivational quote
	function getRandomIntInclusive(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min +1)) + min;
	}
	let randomIndex = getRandomIntInclusive(0, QUOTES.length)

	console.log(randomIndex);

	let randomQuote = QUOTES[randomIndex].citation;
	let quoteAuthor = QUOTES[randomIndex].author;

	// Message

	var data = [
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
	];

	// Sending message

	client.chat.postMessage({
		"channel":WHOS_COMING_CHANNEL,
		"blocks": data,
		"text": `Qui sera là le ${date} ?`
	})
}