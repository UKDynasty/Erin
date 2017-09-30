const natural = require("natural");
const each = require("async").each;

const franchises = require("./franchises");

const erinUtils = {
    identifyFranchiseFromMessage: (message) => {
        return new Promise((resolve, reject) => {
            const tokenizer = new natural.WordTokenizer();
            const tokenisedMessage = tokenizer.tokenize(message);
            let matches = [];
            each(
                franchises,
                (franchise, callback) => {
                    let intersection = tokenisedMessage.filter(x => franchise.identifiers.includes(x.toLowerCase()));
                    if (intersection.length > 0) {
                        matches.push(franchise.canonical);
                    }
                    callback();
                },
                (err) => {
                    if (err) {
                        return reject();
                    } else {
                        if (matches.length > 0) {
                            return resolve(matches);
                        } else {
                            return reject();
                        }
                    }
                });
        })
    },
    getFranchiseInfoFromCanonicalName: (canonicalFranchiseName) => {
        let matching = franchises.filter(franchise => {
            return franchise.canonical === canonicalFranchiseName;
        });
        return (matching.length === 1) ? matching[0] : false;
    }
};

module.exports = erinUtils;