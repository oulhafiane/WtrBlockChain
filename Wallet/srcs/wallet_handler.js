const { TransactionHandler } = require('sawtooth-sdk/processor/handler');
const { InternalError, InvalidTransaction } = require('sawtooth-sdk').exceptions;
const { decodeData, hash} = require('../lib/helper');

const FAMILY_NAME = "wallet-family", VERSION = "1.0", NAMESPACE = hash(FAMILY_NAME).substring(0, 6);

class WalletHandler extends TransactionHandler {
    constructor() {
        super(FAMILY_NAME, [VERSION], [NAMESPACE]);
    }
    
    apply(transactionRequest, context) {
        return decodeData(transactionRequest.payload)
            .then((payload) => {
                let header = transactionProcessRequest.header
                let id = header.signerPublicKey

                if (!payload.action)
                    throw new InvalidTransaction("Payload doesn't contains the action.");
                if (!payload.amount)
                    throw new InvalidTransaction("Payload doesn't contains the amount")

                let address = NAMESPACE + hash(id);
                let action = payload.action;
                switch (action) {
                    case "deposit":
                        let entries = {
                            [address]: payload.amount
                        }
                        context.setState(entries);
                        break;
                    case "withdraw":
                        context.getState([address]).then((possibleAddressValues) => {
                            let value = possibleAddressValues[address];
                            if (value) {
                                if (value) {
                                    if (value - payload.amount >= 0)
                                        value = value - payload.amount;
                                    else
                                        throw new InvalidTransaction("Insuficiant funds.");
                                    let entries = {
                                        [address]: value
                                    }
                                    context.setState(entries);
                                }
                            }
                            else
                                throw new InvalidTransaction("Account not found.");
                        });
                        break;
                    default:
                        throw new InvalidTransaction("The action is invalid.");
                }
            })
            .catch((err) => {
                throw new InternalError("Error while decoding the payload: " + err);
            });

    }
}

module.exports = WalletHandler;