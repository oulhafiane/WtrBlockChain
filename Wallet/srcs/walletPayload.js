const { InvalidTransaction } = require('sawtooth-sdk').exceptions;

class WalletPayload {
    constructor (action, amount) {
        this.action = action;
        this.amount = amount;
    }

    static fromBytes (payload) {
        payload = payload.toString().split(',');
        if (payload.length === 2) {
            let walletPayload = new WalletPayload(payload[0], payload[1]);
            if (!walletPayload.action)
                throw new InvalidTransaction("Action not found.");
            if (!walletPayload.amount)
                throw new InvalidTransaction("Amount not found.");
            
            return walletPayload;
        } else {
            throw new InvalidTransaction("Invalid payload serialization : " + payload);
        }
    }
}

module.exports = {
    WalletPayload
}