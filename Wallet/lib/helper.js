const crypto = require('crypto');

const hash = (x) => crypto.createHash('sha512').update(x).digest('hex').toLocaleLowerCase().substring(0, 64);

module.exports = {
    hash
}