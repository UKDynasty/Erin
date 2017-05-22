#!/usr/bin/env node

const fetch = require("node-fetch");
const client = require('redis').createClient(process.env.REDIS_URL);
const pa = require("./pa");
const eachSeries = require("async/eachSeries");
const ordinalSuffix = require("./util").ordinalSuffix;
const mflAPI = require("./mflAPI");
const franchises = require("./franchises");

const updateLatestReportedPickTimestamp = (timestamp) => {
    return new Promise(
        (resolve, reject) => {
            return client.set("latest-reported-pick-timestamp", timestamp, (err, res) => {
                return resolve(res);
            })
        }
    )
};

const fetchPicks = () => {
    const url = "http://www73.myfantasyleague.com/2017/export?TYPE=draftResults&L=48002&JSON=1";
    return fetch(url)
        .then(res => res.json())
        .then(json => json.draftResults.draftUnit.draftPick)
        .catch(err => err);
};

const filterOutUnmadePicks = (picks) => {
    return picks.filter((pick) => {
        return pick.timestamp > 0;
    });
};

const filterOutPicksAlreadyReported = (picks) => {
    return new Promise(
        (resolve, reject) => {
            return client.get("latest-reported-pick-timestamp", (err, value) => {
                if (err) {
                    reject(err);
                }
                resolve(picks.filter((pick) => {
                    return pick.timestamp > value;
                }));
            });
    });

};

/***
 * Returns a promise that eventually returns an array of draft picks made since the 'last reported pick timestamp' (could be empty)
 * @returns {Promise}
 */
const checkForNewDraftPicks = () => {
    return fetchPicks()
        .then(picks => filterOutUnmadePicks(picks))
        .then(madePicks => filterOutPicksAlreadyReported(madePicks))
        .then(newPicks => {
            if (newPicks.length > 0) {
                updateLatestReportedPickTimestamp(newPicks.slice(-1)[0].timestamp)
            }
            return newPicks;
        })
        .catch(err => err);
};

const draftPickToReadableString = (round, pick, franchise, player, position, nflTeam) => {
    round = ordinalSuffix(parseInt(round, 10));
    pick = ordinalSuffix(parseInt(pick, 10));
    return "With the " + pick + " pick in the " + round + " round, the " + franchise + " select " + player + ", " + position + ", " + nflTeam;
};

const transformName = (name) => {
    return name.split(", ").map(val => val.replace(",", "")).reverse().join(" ");
};

const shorthandPositionToLonghand = (position) => {
    const positions = {
        "QB": "quarterback",
        "RB": "running back",
        "WR": "wide receiver",
        "TE": "tight end"
    };
    return positions.hasOwnProperty(position) ? positions[position] : "";
};

const isAutomaticComment = (comment) => {
    return comment !== "Pick made based on Pre-Draft List"
    && comment !== "Timer Expired Replacement pick made by Commissioner"
    && comment !== "Pick made based on ADP Rank"
    ;
};

const draftWatcher = () => {
    checkForNewDraftPicks()
        .then(res => {
            if (res.length > 0) {
                let playerIds = res.map((pick) => {
                    return pick.player;
                });
                let playerInfo = mflAPI.players(playerIds);
                return playerInfo
                    .then(playersInfo => {
                        let picksText = res.map((pick) => {
                            let franchiseName = franchises.find(x => x.mflFranchiseId === pick.franchise);
                            return draftPickToReadableString(
                                pick.round,
                                pick.pick,
                                franchiseName ? franchiseName.canonical : "",
                                transformName(playersInfo[pick.player].name),
                                shorthandPositionToLonghand(playersInfo[pick.player].position),
                                playersInfo[pick.player].team
                            );
                        });
                        pa.sendDirectMessage("36266918", picksText.join("\n\n"));
                    });

            }
        })
        .catch(err => console.log(err));
};

draftWatcher();