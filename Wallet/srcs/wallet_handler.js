const { TransactionHandler } = require('sawtooth-sdk/processor/handler');
const { InvalidTransaction } = require('sawtooth-sdk').exceptions;
const { WalletPayload } = require('./walletPayload');
const { NAMESPACE, FAMILY_NAME, WalletState} = require('./walletState');

class WalletHandler extends TransactionHandler {
    constructor() {
        super(FAMILY_NAME, ['1.0'], [NAMESPACE]);
    }
    
    apply(transactionRequest, context) {
        let header = transactionRequest.header;
        let user = header.signerPublicKey;
        let payload = WalletPayload.fromBytes(transactionRequest.payload);
        let state = new WalletState(context, user);
        if (payload.action === 'deposit') {
            return state.deposit(payload.amount);
        } else if (payload.action === 'balance') {
            return state.getBalance();
        } else {
            throw new InvalidTransaction("Invalid action.");
        }
    }
}

module.exports = WalletHandler;