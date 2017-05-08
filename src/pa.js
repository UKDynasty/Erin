const erin = require("./erin");
const rp = require("request-promise");
const uuidV1 = require('uuid/v1');

const sendMessageToGroup = (message) => {
    const options = {
        method: 'POST',
        uri: 'https://api.groupme.com/v3/bots/post',
        body: {
            "bot_id" : process.env.GROUPCHAT_BOT_ID,
            "text" : message
        },
        json: true
    };
    return new Promise(
        (resolve, reject) => {
            rp(options)
                .then(function (parsedBody) {
                    resolve(parsedBody);
                })
                .catch(function (err) {
                    reject(err);
                });
        }
    );
};
const sendDirectMessage = (userId, message) => {
    const options = {
        method: "POST",
        uri: "https://api.groupme.com/v3/direct_messages?token=" + process.env.DM_USER_ACCESS_TOKEN,
        body: {
            "direct_message": {
                "source_guid": uuidV1(),
                "recipient_id": userId,
                "text": message
            }
        },
        json: true
    };
    return new Promise(
        (resolve, reject) => {
            rp(options)
                .then(function (parsedBody) {
                    resolve();
                })
                .catch(function (err) {
                    reject(err);
                });
        }
    );
};


const pa = {
    // Receive a message, and return a response from Erin (useful for testing)
    receiveMessage: (message, conversationId) => {
        return new Promise((resolve, reject) => {
            erin.receiveMessage(message, conversationId)
                .then((erinResponse) => {
                    return resolve(erinResponse);
                });
        });
    },
    // Receive a GroupMe message JSON payload, and
    receiveGroupMessage: (message, conversationId) => {
        if (message.name && message.name === process.env.GROUPCHAT_BOT_NAME) {
            console.log(conversationId, "No action necessary, message received came from Erin herself.");
            return;
        }
        if (!message.text.match(/^erin/i) && !message.text.match(/erin\??$/i)) {
            console.log(conversationId, "No action taken, we don't think we were the intended recipient of the message from the group.");
            return;
        }
        console.log(conversationId, "Received message intended for Erin", message);
        erin.receiveMessage(message.text, conversationId)
            .then((erinResponse) => {
                if (erinResponse.status === "success") {
                    sendMessageToGroup(erinResponse.response)
                } else if (erinResponse.status === "error") {
                    console.log(conversationId, "Error status returned from Erin in response object", erinResponse.error);
                } else {
                    console.log(conversationId, "Response from Erin was neither success or error - something bad happened", erinResponse);
                }
            })
    },
    receiveDirectMessage: (message, conversationId) => {
        console.log(conversationId, "Received direct message intended for Erin", message);
        erin.receiveMessage(message.text, conversationId)
            .then((erinResponse) => {
                if (erinResponse.status === "success") {
                    sendDirectMessage(message.sender_id, erinResponse.response)
                } else if (erinResponse.status === "error") {
                    console.log(conversationId, "Error status returned from Erin in response object", erinResponse.error);
                } else {
                    console.log(conversationId, "Response from Erin was neither success or error - something bad happened", erinResponse);
                }
            })    }
};

module.exports = pa;