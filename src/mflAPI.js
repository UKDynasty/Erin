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
                if (Array.isArray(players.players.player)) {
                    return players.players.player.reduce((obj, val) => {
                        obj[val.id] = val;
                        return obj;
                    }, {});
                } else {
                    let ret = {};
                    ret[players.players.player.id] = players.players.player;
                    return ret;
                }
            });
    },
    draftResults: (leagueId, round) => {
        if (!(leagueId > 0)) {
            return new Error("No league ID provided.");
        }
        let params = {
            "TYPE": "draftResults",
            "L": leagueId
        };
        let url = generateApiUrl(params);
        return fetch(url)
            .then(response => response.json())
            .then(json => {
                return json.draftResults.draftUnit.draftPick;
            })
    }
};

mflAPI.draftResults(48002)
    .then(res => console.log(res))
    .catch(err => console.error(err));
module.exports = mflAPI;
