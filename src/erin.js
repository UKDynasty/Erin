const picks = require("./picks");
const franchises = require("./franchises");
const identifyFranchiseFromMessage = require("./erinUtils").identifyFranchiseFromMessage;
const espnAPI = require("./espnAPI");
const erinUtils = require("./erinUtils");

const processMessage = (message, conversationId) => {
    return new Promise((resolve, reject) => {
        if (message.match(/\bsheet\b/i) || message.match(/\bspreadsheet\b/i)) {
            let parameters = {
                type: "simple-link",
                link: "http://bit.do/UKDynastyLeagueFutureDraftPickTrades",
                title: "Rookie pick trades spreadsheet"
            };
            resolve(parameters, conversationId);
        }
        else if (message.match(/\bbylaws\b/i) || message.match(/\brules\b/i)) {
            let parameters = {
                type: "simple-link",
                link: "http://www.ukdynasty.com/bylaws",
                title: "League bylaws"
            };
            resolve(parameters, conversationId);
        }
        else if (message.match(/\brecords\b/i) || message.match(/\bhistory\b/i)) {
            let parameters = {
                type: "simple-link",
                link: "http://www.ukdynasty.com/history",
                title: "History and records"
            };
            resolve(parameters, conversationId);
        }
        else if (message.match(/\bpick\b/i)) {
            let pickString = message.match(/(\d+)\.(\d+)/);
            try {
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
                        let parameters = {
                            type: "pickConfusion"
                        };
                        resolve(parameters, conversationId);
                    });
            } catch(e) {
                let parameters = {
                    type: "pickConfusion"
                };
                resolve(parameters, conversationId);
            }
        }
        else if (message.match(/\bpicks\b/i)) {
            return identifyFranchiseFromMessage(message)
                .then((franchiseIdentificationArray) => {
                    if (franchiseIdentificationArray.length > 1) {
                        throw new Error();
                    } else {
                        return franchiseIdentificationArray[0];
                    }
                })
                .then((franchiseName) => {
                    return picks.picksForFranchise(franchiseName);
                })
                .then((picksData) => {
                    let parameters = {
                        type: "picks",
                        picks: picksData.picks,
                        franchiseName: picksData.franchiseName
                    };
                    resolve(parameters, conversationId);
                })
                .catch((err) => {
                    let parameters = {
                        type: "picksConfusion"
                    };
                    resolve(parameters, conversationId);
                });
        } else if (message.match(/\broster\b/i)) {
            return identifyFranchiseFromMessage(message)
                .then((franchiseIdentificationArray) => {
                    if (franchiseIdentificationArray.length > 1) {
                        throw new Error();
                    } else {
                        return franchiseIdentificationArray[0];
                    }
                })
                .then((franchiseName) => {
                    return erinUtils.getFranchiseInfoFromCanonicalName(franchiseName);
                })
                .then(franchiseInfo => {
                    return espnAPI.roster(franchiseInfo.espnFranchiseId)
                })
                .then(espnRosterData => {
                    return espnRosterData.slots
                        .filter(player => {
                            return player.hasOwnProperty("player")
                        })
                        .sort((a, b) => {
                            return a.player.defaultPositionId - b.player.defaultPositionId;
                        })
                        .map(playerData => {
                            return playerData.player.firstName + " " + playerData.player.lastName + ", " + espnAPI.positionsIds[playerData.player.defaultPositionId-1];
                        })
                })
                .then(roster => {
                    let parameters = {
                        type: "roster",
                        roster: roster
                    };
                    resolve(parameters, conversationId);
                })
                .catch((err) => {
                    let parameters = {
                        type: "picksConfusion",
                        err: err
                    };
                    resolve(parameters, conversationId);
                });
        } else if (message.match(/\blineup\b/i)) {
            return identifyFranchiseFromMessage(message)
                .then((franchiseIdentificationArray) => {
                    if (franchiseIdentificationArray.length > 1) {
                        throw new Error();
                    } else {
                        return franchiseIdentificationArray[0];
                    }
                })
                .then((franchiseName) => {
                    return erinUtils.getFranchiseInfoFromCanonicalName(franchiseName);
                })
                .then(franchiseInfo => {
                    return espnAPI.roster(franchiseInfo.espnFranchiseId)
                })
                .then(espnRosterData => {
                    return espnRosterData.slots
                        .filter(player => {
                            return player.hasOwnProperty("player")
                        })
                        .slice(0,9)
                        .sort((a, b) => {
                            return a.player.defaultPositionId - b.player.defaultPositionId;
                        })
                        .map(playerData => {
                            return playerData.player.firstName + " " + playerData.player.lastName + ", " + espnAPI.positionsIds[playerData.player.defaultPositionId-1];
                        })
                })
                .then(roster => {
                    let parameters = {
                        type: "lineup",
                        lineup: roster
                    };
                    resolve(parameters, conversationId);
                })
                .catch((err) => {
                    let parameters = {
                        type: "picksConfusion",
                        err: err
                    };
                    resolve(parameters, conversationId);
                });
        } else if (message.match(/\bhelp\b/i)) {
            let parameters = {
                type: "help"
            };
            resolve(parameters, conversationId);
        } else if (message.match(/\bscores\b/i) || message.match(/\bscoreboard\b/i)) {
            espnAPI.scoreboard()
                .then(matchups => {
                    return matchups.map(matchup => {
                        return espnAPI.matchupToString(matchup);
                    })
                })
                .then(matchupScores => {
                    let parameters = {
                        type: "scores",
                        matchupScores: matchupScores
                    };
                    resolve(parameters, conversationId);
                });
        } else if (message.match(/love you|like you/i)) {
            let parameters = {
                type: "love"
            };
            resolve(parameters, conversationId);
        }  else if (message.match(/hello|hey|good morning|good afternoon|good evening/i)) {
            let parameters = {
                type: "greeting"
            };
            resolve(parameters, conversationId);
        }  else if (message.match(/titan'?s mascot/i)) {
            let parameters = {
                type: "bucs-mascot"
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
            if (!parameters.picks || !parameters.franchiseName) {
                return new Error("Must pass franchiseName and picks in parameters.");
            }
            const concatenatedPickText = parameters.picks.join("\n");
            const picksResponses = [
                "Here are the picks currently owned by the " + parameters.franchiseName + ": \n" + concatenatedPickText + ".",
                "The picks currently owned by the " + parameters.franchiseName + " are as follows: \n" + concatenatedPickText + "."
            ];
            return picksResponses[Math.floor(Math.random()*picksResponses.length)];
            break;
        case "roster":
            return parameters.roster.join("\n");
        case "simple-link":
            return parameters.title + ": " + parameters.link;
        case "lineup":
            return parameters.lineup.join("\n");
        case "help":
            const helpResponses = [
                "There's no shame in asking for help. Ask me about who owns a rookie pick by saying something like 'Erin, who owns pick 1.08?', or ask what picks a franchise has by asking something like 'What rookie picks do the Seahawks have?'",
                "Help, you say? Sure thing. Ask me about who owns a rookie pick by saying something like 'Erin, who owns pick 1.08?', or ask what picks a franchise has by asking something like 'What rookie picks do the Seahawks have?'"
            ];
            return helpResponses[Math.floor(Math.random()*helpResponses.length)];
            break;
        case "picksConfusion":
            const picksConfusionResponses = [
                "I'm not sure which franchise you're asking about. I'm not a mind reader!",
                "Sorry, I don't know which franchise you're asking about. I could guess, but that would be less than useful."
            ];
            return picksConfusionResponses[Math.floor(Math.random()*picksConfusionResponses.length)];
            break;
        case "pickConfusion":
            const pickConfusionResponses = [
                "You're asking me who owns a pick? Sorry, I don't quite understand, sorry. Make sure you tell me the pick like this: '2.06' or '3.11'",
                "I don't quite know what you mean, but I know you want to know about a pick. Maybe I'm telepathic."
            ];
            return pickConfusionResponses[Math.floor(Math.random()*pickConfusionResponses.length)];
            break;
        case "love":
            const loveResponses = [
                "Aw, shucks. Thanks. I guess I like you a bit, too.",
                "I'm not actually that keen on getting close to people, especially fantasy football degenerates. I've been down that road before.",
                "Well, thanks. I like you, in your own special way."
            ];
            return loveResponses[Math.floor(Math.random()*loveResponses.length)];
        case "greeting":
            const greetingResponses = [
                "Hey there.",
                "Hello.",
                "G'day."
            ];
            return greetingResponses[Math.floor(Math.random()*greetingResponses.length)];
        case "newDraftPicksMade":
            const picksText = parameters.newPicks.map((pick) => {
                
            }).join("\n\n");
            break;
        case "confusion":
            const confusionResponses = [
                "I'm sorry, I don't know what you're asking me.",
                "Apologies, I've got no idea what you're talking about. Ask for help if you're stuck.",
                "Pardon? I really don't know what you mean, sorry."
            ];
            return confusionResponses[Math.floor(Math.random()*confusionResponses.length)];
            break;
        case "scores":
            return parameters.matchupScores.join("\n\n");
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
    },

};

module.exports = erin;