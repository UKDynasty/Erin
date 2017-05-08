const picks = require("./picks");
const franchises = require("./franchises");
const identifyFranchiseFromMessage = require("./erinUtils").identifyFranchiseFromMessage;

const processMessage = (message, conversationId) => {
    return new Promise((resolve, reject) => {
        if (message.match(/pick \d*\.\d*/)) {
            let pickString = message.match(/pick (\d*)\.(\d*)/);
            let pick = ((pickString[1] - 1) * 12) + parseInt(pickString[2], 10);
            return picks.whoOwnsPick(pick)
                .then((owner) => {
                    let parameters = {
                        type: "pick",
                        franchiseName: owner
                    };
                    return resolve(parameters, conversationId);
                })
                .catch((err) => {
                    return reject(err, conversationId);
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
                    resolve(parameters, conversationId);
                })
        }
        else if (message === "Hello" || message === "Good morning") {
            let parameters = {
                type: "greeting"
            };
            resolve(parameters, conversationId);
        } else {
            let parameters = {
                type: "confusion"
            };
            resolve(parameters, conversationId);
        }
    });
};

const generateResponse = (parameters) => {
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
};

const erin = {
    // Return an Erin response, which looks like this:
    // {
    //    status: "success" if Erin successfully processed the message and came up with a response, or "error" if an error was thrown during processing/response generation
    //    response: if successful, contains Erin's reply as a string
    //    error: if error, contains the error message (may not be user-facing-appropriate - this could come from a JSON parse error or anything)
    //    conversationId: the uuid of the conversation that was given to Erin in the first place
    // }
    receiveMessage: (message, conversationId) => {
        return processMessage(message, conversationId)
            .then((responseParameters, conversationId) => {
                return generateResponse(responseParameters, conversationId);
            })
            .then((response, conversationId) => {
                return {
                    status: "success",
                    response: response,
                    conversationId: conversationId
                };
            })
            .catch((err, conversationId) => {
                return {
                    status: "error",
                    error: err,
                    conversationId: conversationId
                };
            })
    }
};

module.exports = erin;