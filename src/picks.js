const GoogleSpreadsheet = require('google-spreadsheet');
const each = require('async').each;

const picks = {
    getSheet: function() {
        return new Promise(
            (resolve, reject) => {
                const sheet = new GoogleSpreadsheet('1tsYQSMBHSD3nFUQS6urrnqYPJQs94c-IdjJi1CznX1c');
                return sheet.getInfo((err, info) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(info.worksheets[3]);
                    }
                });
            }
        )
    },
    getPreDraftSheet: function() {
        return new Promise(
            (resolve, reject) => {
                const sheet = new GoogleSpreadsheet('1tsYQSMBHSD3nFUQS6urrnqYPJQs94c-IdjJi1CznX1c');
                return sheet.getInfo((err, info) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(info.worksheets[0]);
                    }
                });
            }
        )
    },
    whoOwnsPick: function(pick) {
        return new Promise((resolve, reject) => {
            return this.getSheet()
                .then((sheet) => {
                    sheet.getRows({
                    }, (err, rows) => {
                        if (err) {
                            return reject(err);
                        } else {
                            let offset = pick - 1;
                            if (!rows[offset]) {
                                return reject("pick-not-found")
                            }
                            return resolve(rows[offset].owner);
                        }
                    });
                })
            }
        );
    },
    preDraftPicksForFranchise: function(franchise) {
        let franchiseShorthand = franchise.replace(" ", "").toLowerCase();
        return new Promise((resolve, reject) => {
                return this.getPreDraftSheet()
                    .then((sheet) => {
                        sheet.getRows({}, (err, rows) => {
                            if (err) {
                                return reject(err);
                            } else {
                                let picks = rows
                                    .filter (row => {
                                        return row[franchiseShorthand].length > 0;
                                    })
                                    .map((row) => {
                                        return row[franchiseShorthand].replace(" from the " + franchise, "");
                                    });
                                return resolve({
                                    franchiseName: franchise,
                                    picks: picks
                                });
                            }
                        });
                    })
            }
        );
    },
    picksForFranchise: function(franchise) {
        return new Promise((resolve, reject) => {
                return this.getSheet()
                    .then((sheet) => {
                        sheet.getRows({}, (err, rows) => {
                            if (err) {
                                return reject(err);
                            } else {
                                let picks = [];
                                each(
                                    rows,
                                    (row, callback) => {
                                        if (row.owner === franchise) {
                                            let pickText = row.comments.length > 0 ? row.x + " " + row.comments : row.x;
                                            picks.push(pickText);
                                        }
                                        callback();
                                    },
                                    (err) => {
                                        if (err) {
                                            return reject(err);
                                        } else {
                                            return resolve({
                                                franchiseName: franchise,
                                                picks: picks
                                            });
                                        }
                                    });

                            }
                        });
                    })
            }
        );
    }
};

module.exports = picks;