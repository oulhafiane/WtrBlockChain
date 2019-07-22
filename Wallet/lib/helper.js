const crypto = require('crypto');

const decodeData = (payload) => {
    return new Promise((resolve, reject) => {
        let result = JSON.parse(payload);
        result ? resolve(result) : reject(result);
    });
}

const hash = (x) => crypto.createHash('sha512').update(x).digest('hex').toLocaleLowerCase().substring(0, 64);

module.exports = {
    decodeData,
    hash
}