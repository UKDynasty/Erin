const apiBaseUrl = "http://games.espn.com/ffl/api/v2";
const queryStringFromObjectKeysValues = require("./util").queryStringFromObjectKeysValues;
const fetch = require("node-fetch");

const defaultParams = {
    "leagueId": "7168",
    "seasonId": "2017"
};

const generateApiUrl = (type, params) => {
    return apiBaseUrl + "/" + type + generateParamsQueryString(params);
};

const generateParamsQueryString = (params) => {
    let mergedParams = Object.assign(defaultParams, params);
    return queryStringFromObjectKeysValues(mergedParams);
};

const espnAPI = {
    positionsIds: [
        "QB", "RB", "WR", "TE"
    ],
    scoreboard: () => {
        return fetch(generateApiUrl("scoreboard", {}))
            .then((response) => response.json())
            .then((json) => {
                return json.scoreboard.matchups;
            });
    },
    roster: (franchiseId) => {
        return fetch(generateApiUrl("rosterInfo", {
            "teamIds": franchiseId
        }))
            .then(response => response.json())
            .then(json => {
                return json.leagueRosters.teams[0]
            });
    },
    matchupToString: (matchup) => {
        let homeTeam = matchup.teams[0];
        let awayTeam = matchup.teams[1];
        if (!awayTeam) {
            // Team is on bye
            return `Bye: ${homeTeam.team.teamLocation} ${awayTeam.team.teamNickname}`;
        }
        return `${awayTeam.team.teamLocation} ${awayTeam.team.teamNickname} ${awayTeam.score}\n${homeTeam.team.teamLocation} ${homeTeam.team.teamNickname} ${homeTeam.score}`;
    }
};

module.exports = espnAPI;