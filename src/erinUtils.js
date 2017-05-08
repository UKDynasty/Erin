const natural = require("natural");
const each = require("async").each;

const franchises = require("./franchises");

const erinUtils = {
    identifyFranchiseFromMessage: (message) => {
        return new Promise((resolve, reject) => {
            const tokenizer = new natural.WordTokenizer();
            const tokenisedMessage = tokenizer.tokenize(message);
            each(
                franchises,
                (franchise, callback) => {
                    let intersection = tokenisedMessage.filter(x => franchise.uniqueIdentifiers.includes(x.toLowerCase()));
                    if (intersection.length > 0) {
                        return resolve(franchise.canonical);
                    }
                    callback();
                },
                (err) => {

                });
        })
    },
};

module.exports = erinUtils;