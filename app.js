require('dotenv').config()
var CronJob = require('cron').CronJob;
const {App, LogLevel} = require ('@slack/bolt');
const {WebClient} = require ('@slack/web-api')

const QUOTES = require('./citations.json');

// Initializing the App
const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	signingSecret: process.env.SLACK_SIGNIN_SECRET,
	socketMode: true,
	appToken: process.env.SLACK_APP_TOKEN,
	logLevel: LogLevel.DEBUG
});
// Initilizing client to call API methods directly
const client = new WebClient(process.env.SLACK_BOT_TOKEN, {
	logLevel: LogLevel.DEBUG
});

const TEST_CHANNEL = "C02P26U1E4D"
const WHOS_COMING_CHANNEL = "C02QBKTJL5A"

// --------------- Cron job test ---------------

var job = new CronJob(
	// * * * * 1-4,7
	"*/2 * * * *",
	// "*/1 * * * *",
	function() {
	whosComingMessage();
	console.log("Cron onTick function triggered");
	},
	null,
);

// job.start();

// --------------- Sending a recurring message to a channel ---------------

// const sendRecurringMessage = () => {
// 	const interval = 10*1000
// 	setInterval(sendMessage, interval);
// }


// const sendMessage = async () => {
// 	console.log("sendMessage runned")
// 	let NOW = Math.floor(Date.now()/1000);
// 	let postTime = NOW + 20;
// 	console.log(postTime)

// 		try {
// 			const result = await client.chat.scheduleMessage({
// 				channel: TEST_CHANNEL,
// 				post_at: postTime,
// 				text: `Scheduled message from bot ! at ${postTime}`
// 			})
// 			console.log("Result :", result)
// 		} catch (error) {
// 			console.error(error);
// 		}
// }



// --------------- listens to incoming messages that contains "hello" ---------------

app.message("hello", async ({message, say})=> {

console.log("message object : ", message);

await say({
	blocks: [
		{
			type:"section",
			text:{
				type:"mrkdwn",
				text: `Hey there <@${message.user}>!`
			},
			accessory: {
				type:"button",
				text: {
					type:"plain_text",
					text: "Click Me"
				},
				action_id:"button_click"
			}
		}
	],
	text: `Hey there <@${message.user}>!`
})

app.action("button_click", async ({body, ack, say}) =>{
	// Acknowledge the action

	await ack();
	console.log("Button clicked body object :", body)
	await say(`<@${body.user.id}> clicked the button`)

})

});

// --------------- TEST MESSAGE SHORTCUT ---------------

// The open_modal shortcut opens a plain old modal
app.shortcut('open_modal', async ({ shortcut, ack, client }) => {

  try {
    // Acknowledge shortcut request
    await ack();

    // Call the views.open method using one of the built-in WebClients
	 console.log("Shortcut Message object :", shortcut);
    const result = await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: {
        type: "modal",
        title: {
          type: "plain_text",
          text: "Plain Modal App"
        },
        close: {
          type: "plain_text",
          text: "Close"
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "About the simplest modal you could conceive of :smile:\n\nMaybe <https://api.slack.com/reference/block-kit/interactive-components|*make the modal interactive*> or <https://api.slack.com/surfaces/modals/using#modifying|*learn more advanced modal use cases*>."
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "Psssst this modal was designed using <https://api.slack.com/tools/block-kit-builder|*Block Kit Builder*>"
              }
            ]
          }
        ]
      }
    });

    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});

// --------------- TEST GLOBAL SHORCUT ---------------

app.shortcut('wave_emoji', async({shortcut, ack, client})=>{

	try{
		await ack();

	console.log("Shortcut Global Object :", shortcut);

	const result = await client.views.open({
		trigger_id: shortcut.trigger_id,
		view: {
			type: "modal",
			callback_id: "wave_callback_id",
			title:{
				type: "plain_text",
				text: "Message anywhere"
			},
			close: {
				type: "plain_text",
				text: "Close"
			},
			blocks: [
				{
					type: "input",
					block_id: "input-block",
					element: {
						type: "plain_text_input",
						action_id: "input-action"
					},
					label: {
						type: "plain_text",
						text: "Label",
						emoji: true
					}
				},
				{
					type: "input",
					block_id: "select-conversation-block",
					label: {
						type: "plain_text",
						text: "Message in this conversation",
						emoji: true
					},
					element:
						{
							type: "conversations_select",
							placeholder: {
								type: "plain_text",
								text: "Select a conversation",
								emoji: true
							},
							default_to_current_conversation: true,
							response_url_enabled: true,
							action_id: "conversation-action"
						}
				}
			],
			submit:{
				type:"plain_text",
				text:"submit",
			}
		}
	});

	console.log(result);
	
	} catch (error){
		console.error(error)
	}

	app.view("wave_callback_id", async({ack, say, body, view})=> {

	try{
	await ack();
	console.log("Body object when submit :", body);
	console.log("View object when submit :",view);
	console.log("View.state.values : ",view.state.values)

	const val = view.state.values["input-block"]["input-action"].value;
	const channel = view.state.values["select-conversation-block"]["conversation-action"].selected_conversation;

	const result = await client.chat.postMessage ({
		channel: channel,
		text: val,
	})

	console.log("Result post Message : ", result)

	} catch (error){
		console.error(error);
	}
	

})

});

// --------------- WHO'S COMING LOGIC ---------------

const whosComingMessage= async () => {

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
					"action_id":"coming_button_action_id"
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
					"action_id":"not_coming_button_action_id"
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
					"action_id":"coming_button_action_id"
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
					"action_id":"not_coming_button_action_id"
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


	app.action("coming_button_action_id", async ({body, ack}) =>{
		
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
			"blocks": newBlocks,
		})

	})


	app.action("not_coming_button_action_id", async ({body, ack}) =>{
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
			"blocks": newBlocks,
		})

	})
};

// --------------- STARTING THE APP ---------------

(async () => {
	await app.start(process.env.PORT || 3000)
	console.log("Bolt app is running !")
})();




// Body object when submit : {
//   type: 'view_submission',
//   team: { id: 'T02NQFGTLB1', domain: 'sandboxworkspacesiege' },
//   user: {
//     id: 'U02PUS3ALEL',
//     username: 'labrusse.thomas',
//     name: 'labrusse.thomas',
//     team_id: 'T02NQFGTLB1'
//   },
//   api_app_id: 'A02NYTLGHK8',
//   token: 'KOI3M5USPgKMa4Kqwvu1o3hC',
//   trigger_id: '2807512734086.2772526938375.94f2a535bcc502f571aa47c287f35f12',
//   view: {
//     id: 'V02Q0E1V5NG',
//     team_id: 'T02NQFGTLB1',
//     type: 'modal',
//     blocks: [ [Object], [Object] ],
//     private_metadata: '',
//     callback_id: 'wave_callback_id',
//     state: { values: [Object] },
//     hash: '1638957154.gL5PpxLy',
//     title: { type: 'plain_text', text: 'Message anywhere', emoji: true },
//     clear_on_close: false,
//     notify_on_close: false,
//     close: { type: 'plain_text', text: 'Close', emoji: true },
//     submit: { type: 'plain_text', text: 'submit', emoji: true },
//     previous_view_id: null,
//     root_view_id: 'V02Q0E1V5NG',
//     app_id: 'A02NYTLGHK8',
//     external_id: '',
//     app_installed_team_id: 'T02NQFGTLB1',
//     bot_id: 'B02P2P3S7C6'
//   },
//   response_urls: [
//     {
//       block_id: 'select-conversation-block',
//       action_id: 'conversation-action',
//       channel_id: 'C02P55P4YGK',
//       response_url: 'https://hooks.slack.com/app/T02NQFGTLB1/2816478389204/qoLgoIJvGdwgXbct9vI6NUFC'
//     }
//   ],
//   is_enterprise_install: false,
//   enterprise: null
// }





// Command Payload Body : {
//   token: 'KOI3M5USPgKMa4Kqwvu1o3hC',
//   team_id: 'T02NQFGTLB1',
//   team_domain: 'sandboxworkspacesiege',
//   channel_id: 'C02P55P4YGK',
//   channel_name: 'général',
//   user_id: 'U02PUS3ALEL',
//   user_name: 'labrusse.thomas',
//   command: '/test',
//   text: '',
//   api_app_id: 'A02NYTLGHK8',
//   is_enterprise_install: 'false',
//   response_url: 'https://hooks.slack.com/commands/T02NQFGTLB1/2837923437456/GM5WBqKh4DWzqQZTvX7xEwr6',
//   trigger_id: '2826833503297.2772526938375.2ab8e4b6a1d2168ae70b7f591964c135'
// }





// Button clicked body object : {
//   type: 'block_actions',
//   user: {
//     id: 'U02PUS3ALEL',
//     username: 'labrusse.thomas',
//     name: 'labrusse.thomas',
//     team_id: 'T02NQFGTLB1'
//   },
//   api_app_id: 'A02NYTLGHK8',
//   token: 'KOI3M5USPgKMa4Kqwvu1o3hC',
//   container: {
//     type: 'message',
//     message_ts: '1638957914.001300',
//     channel_id: 'C02P55P4YGK',
//     is_ephemeral: false
//   },
//   trigger_id: '2811327070821.2772526938375.272aa9c7a82b2deee0375ca7bef6b2ca',
//   team: { id: 'T02NQFGTLB1', domain: 'sandboxworkspacesiege' },
//   enterprise: null,
//   is_enterprise_install: false,
//   channel: { id: 'C02P55P4YGK', name: 'général' },
//   message: {
//     bot_id: 'B02P2P3S7C6',
//     type: 'message',
//     text: 'Hey there <@U02PUS3ALEL>!',
//     user: 'U02P9E4F7S6',
//     ts: '1638957914.001300',
//     team: 'T02NQFGTLB1',
//     blocks: [ [Object] ]
//   },
//   state: { values: {} },
//   response_url: 'https://hooks.slack.com/actions/T02NQFGTLB1/2814294364035/RJVpbtDBIUjzSVDT6YaIsHdU',
//   actions: [
//     {
//       action_id: 'button_click',
//       block_id: 'ZXN',
//       text: [Object],
//       type: 'button',
//       action_ts: '1638957919.049393'
//     }
//   ]
// }




// ----------- Code snippet for Commmands functions --------------
// app.command('/test', async({body, client, ack}) => {
// 	await ack();
// 	console.log('Command Body :', body);
// 	try {
// 	await client.chat.postMessage({