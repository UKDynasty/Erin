const rp = require("request-promise");
const uuidV1 = require('uuid/v1');
const each = require("async").each;

const picks = require("./picks");
const franchises = require("./franchises");
const identifyFranchiseFromMessage = require("./processing").identifyFranchiseFromMessage;

const bot = {
    processMessage: (message) => {
        return new Promise((resolve, reject) => {
            if (message.match(/pick \d*\.\d*/)) {
                let pickString = message.match(/pick (\d*)\.(\d*)/);
                let pick = ((pickString[1]-1)*12) + parseInt(pickString[2], 10);
                return picks.whoOwnsPick(pick)
                    .then((owner) => {
                        let parameters = {
                            type: "pick",
                            franchiseName: owner
                        };
                        return resolve(parameters);
                    })
                    .catch((err) => {
                        return reject(err);
                    });
            }
            else if (message.match(/picks/i)) {
                return identifyFranchiseFromMessage(message)
                    .then((franchiseName) => {
                        return picks.picksForFranchise(franchiseName);
                    })
                    .then((picks) => {
                        let parameters = {
                            type: "picks",
                            picks: picks
                        };
                        resolve(parameters);
                    })
            }
            else if (message === "Hello" || message === "Good morning") {
                let parameters = {
                    type: "greeting"
                };
                resolve(parameters);
            } else {
                let parameters = {
                    type: "confusion"
                };
                resolve(parameters);
            }
        });
    },
    generateResponse: function(parameters) {
        switch (parameters.type) {
            case "pick":
                if (!parameters.franchiseName) {
                    return new Error("Must pass franchiseName in parameters.");
                }
                const pickResponses = [
                    "That pick's currently owned by the " + parameters.franchiseName,
                    "The " + parameters.franchiseName + " currently own that pick."
                ];
                return pickResponses[Math.floor(Math.random()*pickResponses.length)];
                break;
            case "picks":
                if (!parameters.picks) {
                    return new Error("Must pass franchiseName and picks in parameters.");
                }
                return "Sure. Here are the picks currently owned by them: " + parameters.picks.join(", ");
                break;
            case "greeting":
                const greetingResponses = [
                    "Hey there.",
                    "Hello.",
                    "Bonjour."
                ];
                return greetingResponses[Math.floor(Math.random()*greetingResponses.length)];
                break;
            case "confusion":
                return "I'm sorry, I don't know what you're asking me.";
                break;
        }
    },
    sendMessageToGroup: (message) => {
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
    },
    sendDirectMessage: (userId, message) => {
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
    }
};

module.exports = bot;