const crypto = require('crypto');

class WalletState {
    constructor (context, user) {
        this.context = context;
        this.timeout = 500;
        this.address = _makeWalletAddress(user);
    }

    getBalance () {
        return this.context.getState(this.address, this.timeout)
            .then((amount) => {
                if (amount) {
                    console.log("you balance is : " + amount + " ==> " + JSON.stringify(amount));
                    return amount;
                } else {
                    return 0;
                }
            })
    }

    deposit (amountToDeposit) {
        let newAmout = amountToDeposit;
        let entries = {
            [this.address]: "deposit," + newAmout.toString()
        }

        return this.context.setState(entries, this.timeout);
    }
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
