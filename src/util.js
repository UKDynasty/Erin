const util = {
    ordinalSuffix: (n) => {
        let suffix = Math.floor(n / 10) === 1
            ? 'th'
            : (n % 10 === 1
                ? 'st'
                : (n % 10 === 2
                    ? 'nd'
                    : (n % 10 === 3
                        ? 'rd'
                        : 'th')));
        return n + suffix;
    },
    queryStringFromObjectKeysValues: (obj) => {
        return "?" + Object.keys(obj).map(k => `${k}=${obj[k]}`).join('&');
    }
};

module.exports = util;