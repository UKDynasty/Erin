const picks = require("./picks");
const franchises = require("./franchises");
const identifyFranchiseFromMessage = require("./erinUtils").identifyFranchiseFromMessage;

const processMessage = (message, conversationId) => {
    return new Promise((resolve, reject) => {
        if (message.match(/pick \d*\.\d*/)) {
            let pickString = message.match(/(\d*)\.(\d*)/);
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
        else if (message.match(/help/i)) {
            let parameters = {
                type: "help"
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
        case "help":
            const helpResponses = [
                "There's no shame in asking for help. Ask me about who owns a rookie pick by saying something like 'Erin, who owns pick 1.08?', or ask what picks a franchise has by asking something like 'What rookie picks do the Seahawks have?'",
                "Help, you say? Sure thing. Ask me about who owns a rookie pick by saying something like 'Erin, who owns pick 1.08?', or ask what picks a franchise has by asking something like 'What rookie picks do the Seahawks have?'"
            ];
            return helpResponses[Math.floor(Math.random()*helpResponses.length)];
            break;
        case "confusion":
            const confusionResponses = [
                "I'm sorry, I don't know what you're asking me. Do ask for help!",
                "Apologies, I've got no idea what you're talking about. Ask for help if you're stuck.",
                "Pardon? I really don't know what you mean, sorry."
            ];
            return
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