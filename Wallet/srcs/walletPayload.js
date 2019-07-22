const { InvalidTransaction } = require('sawtooth-sdk').exceptions;
const cbor = require('cbor');

class WalletPayload {
	constructor (action, amount) {
		this.action = action;
		this.amount = amount;
	}

	static fromBytes (payload) {
		payload = cbor.decodeFirstSync(payload);
		let walletPayload = new WalletPayload(payload.action, payload.amount);
		if (!walletPayload.action)
			throw new InvalidTransaction("Action not found.");
		if (!walletPayload.amount)
			throw new InvalidTransaction("Amount not found.");

		return walletPayload;
	}
}

module.exports = {
	WalletPayload
}
