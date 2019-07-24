const { InvalidTransaction } = require('sawtooth-sdk').exceptions;

class WalletState {
    constructor (context, address) {
        this.context = context;
        this.timeout = 500;
        this.address = address;
        console.log("hahia l adresss : " + address);
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
        console.log("rah dkhalna hnaaa o hahia l address : " + this.address)l
        let entries = {
            [this.address]: oldAmount + amountToDeposit
        }

        console.log('o rah wslana ta hna 3awtani 2/2');
        return this.context.setState(entries, this.timeout);
    }
}

module.exports = {
    WalletState
}
