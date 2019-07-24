const crypto = require('crypto');

class WalletState {
    constructor (context, user) {
        this.context = context;
        this.timeout = 500;
        this.address = _makeWalletAddress(user);
        console.log("hahia l adresss : " + this.address);
    }

    getBalance () {
        return this.context.getState(this.address, this.timeout)
            .then((amount) => {
                if (amount) {
                    console.log("you balance is : " + amount);
                    return amount;
                } else {
                    return 0;
                }
            })
    }

    deposit (amountToDeposit) {
      //  let newAmount = this.getBalance() + amountToDeposit;
        let newAmount = 124;
        let entries = {
            [this.address]: newAmount
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
