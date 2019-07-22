const { InvalidTransaction } = require('sawtooth-sdk').exceptions;

class WalletState {
    constructor (context, address) {
        this.context = context;
        this.timeout = 500;
        this.address = address;
    }

    getBalance () {
        return this.context.getState(this.address, this.timeout)
            .then((amount) => {
                if (amount) {
                    return amount;
                } else {
                    return 0;
                }
            })
    }

    deposit (amountToDeposit) {
        oldAmount = this.getBalance();
        let entries = {
            [this.address]: oldAmount + amountToDeposit
        }

        return this.context.setState(entries, this.timeout);
    }
}

module.exports = {
    WalletState
}
