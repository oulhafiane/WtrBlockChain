const crypto = require('crypto');

class WalletState {
    constructor (context, user) {
        this.context = context;
        this.timeout = 500;
        this.address = _makeWalletAddress(user);
    }

    getBalance () {
        return this.context.getState([this.address], this.timeout)
            .then((amounts) => {
                let amount = amounts[this.address];
                if (amount) {
                    amount = _deserialize(amount);
                    console.log("you balance is : " + amount);
                    return amount;
                } else {
                    return 0;
                }
            })
            .catch((error) => {
                console.log(error);
            })
    }

    deposit (amountToDeposit) {
        let newAmout = amountToDeposit + this.getBalance();
        let data = _serialize(newAmout.toString());
        let entries = {
            [this.address]: data
        }

        return this.context.setState(entries, this.timeout);
    }
}

const _deserialize = (data) => {
    amount = data.split(',')[1];

    return amount;
}

const _serialize = (amount) => {
    let data = [];
    data.push(['funds', amount].join(','));
    
    return Buffer.from(data.join(''));
}

const _hash = (x) =>
  crypto.createHash('sha512').update(x).digest('hex').toLowerCase().substring(0, 64)

const FAMILY_NAME = 'wallet-family'

const NAMESPACE = _hash(FAMILY_NAME).substring(0, 6)

const _makeWalletAddress = (x) => NAMESPACE + _hash(x)


module.exports = {
    NAMESPACE,
    FAMILY_NAME,
    WalletState
}
