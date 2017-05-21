const apiBaseUrl = "http://www03.myfantasyleague.com/2017/export";
const queryStringFromObjectKeysValues = require("./util").queryStringFromObjectKeysValues;
const fetch = require("node-fetch");

const defaultParams = {
    "JSON": "1"
};

const generateParamsQueryString = (params) => {
    let mergedParams = Object.assign(defaultParams, params);
    return queryStringFromObjectKeysValues(mergedParams);
};

const generateApiUrl = (params) => {
    return apiBaseUrl + generateParamsQueryString(params);
};

const mflAPI = {
    players: (playerIds = []) => {
        let commaSeparatedPlayerIds = playerIds.join(",");
        let params = {
            "TYPE": "players",
            "PLAYERS": commaSeparatedPlayerIds,
            "DETAILS": "1"
        };
        let url = generateApiUrl(params);
        return fetch(url)
            .then(response => response.json())
            .then(players => {
                return players.players.player.reduce((obj, val) => {
                    obj[val.id] = val;
                    return obj;
                }, {});
            });
    }
};

module.exports = mflAPI;
