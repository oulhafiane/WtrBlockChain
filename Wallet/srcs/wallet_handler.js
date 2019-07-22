const { TransactionHandler } = require('sawtooth-sdk/processor/handler');
const { InvalidTransaction } = require('sawtooth-sdk').exceptions;
const { hash } = require('../lib/helper');
const { WalletState } = require('./walletState');
const { WalletPayload } = require('./walletPayload');

const FAMILY_NAME = "wallet-family", VERSION = "1.0", NAMESPACE = hash(FAMILY_NAME).substring(0, 6);

class WalletHandler extends TransactionHandler {
    constructor() {
        super(FAMILY_NAME, [VERSION], [NAMESPACE]);
    }
    
    apply(transactionRequest, context) {
        let header = transactionRequest.header;
        let user = header.signerPublicKey;
        let address = NAMESPACE + hash(user);
        let payload = WalletPayload.fromBytes(transactionRequest.payload);
        let state = new WalletState(context, address);
        if (payload.action === 'deposit') {
            return state.deposit(payload.amount);
        } else {
            throw new InvalidTransaction("Invalid action.");
        }
    }
}

module.exports = WalletHandler;