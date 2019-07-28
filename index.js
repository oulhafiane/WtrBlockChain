const fetch = require('node-fetch');
const crypto = require('crypto');
const { createHash } = require('crypto');
const {protobuf} = require('sawtooth-sdk')
const request = require('request');
const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1')	
const { InternalError } = require('sawtooth-sdk').exceptions;
const cbor = require('cbor');

const _generateNewKey = (x) => crypto.randomBytes(x);

const hash = (x) => createHash('sha512').update(x).digest('hex').toLocaleLowerCase().substring(0, 64);

const buyer = '028a8ba815bacb078a1b0405af0ad29566a4e570d2bbecb450d8dc0f1708087144';
const seller = '020ca88023d91a3625b8d4f420b047daa2c58a189d189c06e18afb6761e7a4c19c';
const bidder1 = '02ab8153ca37a5ac804c5ecabbaa7d9e1abb603a40407beaffd8087bd65a59fb8f';
const bidder2 = '02e1bf7b98a819fc87369fb4344667b2570e24ac0665cdabc96a94a10682a5c28c';

const context = createContext('secp256k1')
const nonce = new Date() + "," + Math.random();

//const privateKeyStrBuf = "0217f03506992566092d679dbdb8c459d20cd197240d0a0fcfb591af218c7277";


let address;
let privateKeyStrBuf;
let privateKeyStr;
let privateKey;
let signer;
let payload;

switch (process.argv[2]) {
    case "balance":
        getBalance();
        break;
    case "enterAuction2":
    case "enterAuction1":
    case "enterAuction":
	if (process.argv[3] && process.argv[4]) {
		address = hash("wtr-transaction-family").substring(0, 6) + hash(process.argv[3]).substring(0, 64);
		addressAuction = hash("wtr-transaction-family").substring(0, 6) + hash(process.argv[3] + '-auction').substring(0, 64);
if (process.argv[2] === 'enterAuction2') {
		privateKeyStrBuf = "1562078f47249ac2bb5d7161e4abd10e9aec80adfb075b0a79ee61c953d1fe86";
		addressBuyer = hash("wtr-transaction-family").substring(0, 6) + hash(bidder2);
} else if (process.argv[2] === 'enterAuction1') {
		privateKeyStrBuf = "37d6e558cd7a4e21971b27c495d1701a47d8b618e54fa3ee08dd500f3be6163f";
		addressBuyer = hash("wtr-transaction-family").substring(0, 6) + hash(bidder1);
} else {
		privateKeyStrBuf = "7122744c74d6193bde45787812b91f0447e9cda4a8e6ea257067f17f65427956";
		addressBuyer = hash("wtr-transaction-family").substring(0, 6) + hash(seller);
}
		addressParameters = hash("wtr-transaction-family").substring(0, 6) + hash('WtrParameters').substring(0, 64);
		console.log("addressBidder : " + addressBuyer);
		console.log("offer address : " + address);
		console.log("auction address : " + addressAuction);
		console.log("parameters address: " + addressParameters);
		privateKeyStr = privateKeyStrBuf.toString().trim();
		privateKey = Secp256k1PrivateKey.fromHex(privateKeyStr);
		signer = new CryptoFactory(context).newSigner(privateKey);
		payload = {
			action: "enterAuction",
			offer: process.argv[3],
			bid: process.argv[4]
		};
		console.log("signer : " + signer.getPublicKey().asHex());
		sendBatch(payload, signer, [address, addressBuyer, addressAuction, addressParameters], [address, addressBuyer, addressAuction]);
	} else {
		throw new InternalError("Lol ok bye");
	}
	break;
    case "createOffer":
	if (process.argv[3] && process.argv[4] && process.argv[5]) {
		if (process.argv[4] === 'auction' && !process.argv[6])
			throw new InternalError("lol ok byee.");
		let period = null;
		if (process.argv[6])
			period = process.argv[6];
		console.log("period is : " + period);
		address = hash("wtr-transaction-family").substring(0, 6) + hash(process.argv[3]).substring(0, 64);
		addressBuyer = hash("wtr-transaction-family").substring(0, 6) + hash(buyer);
		addressParameters = hash("wtr-transaction-family").substring(0, 6) + hash('WtrParameters').substring(0, 64);
		console.log("addressOwner : " + addressBuyer);
		console.log("offer address : " + address);
		console.log("parameters address: " + addressParameters);
		privateKeyStrBuf = "161c920b77b770d2bc3e53db93544da6af964445b2f5a123d406bff9ac0ee7f1";
		privateKeyStr = privateKeyStrBuf.toString().trim();
		privateKey = Secp256k1PrivateKey.fromHex(privateKeyStr);
		signer = new CryptoFactory(context).newSigner(privateKey);
		payload = {
			action: "createOffer",
			offer: process.argv[3],
			type: process.argv[4],
			startDate: new Date(),
			period: period,
			total: process.argv[5]
		};
		console.log("signer : " + signer.getPublicKey().asHex());
		sendBatch(payload, signer, [address, addressBuyer, addressParameters], [address, addressBuyer]);
	} else {
		throw new InternalError("Lol ok bye");
	}
	break;
    case "addParameter":
        if (process.argv[3] && process.argv[4]) {
		address = hash("wtr-transaction-family").substring(0, 6) + hash('WtrParameters');
		console.log("address : " + address);
		privateKeyStrBuf = "40c14fa8090eb01d984f85c4e7a57bc9db77c4aec75691e729a7924c20d563ea";
		privateKeyStr = privateKeyStrBuf.toString().trim();
		privateKey = Secp256k1PrivateKey.fromHex(privateKeyStr);
		signer = new CryptoFactory(context).newSigner(privateKey)
		payload = {
			action: "addParameter",
			name: process.argv[3],
			value: process.argv[4]
		};
		console.log("signer : " + signer.getPublicKey().asHex());
		sendBatch(payload, signer, [address], [address]);
	} else
		throw new InternalError("Lol ok bye");
	break;
    case "terminate":
	if (process.argv[3] && process.argv[4] && process.argv[5]) {
		address = process.argv[3];
		addressSeller = hash("wtr-transaction-family").substring(0, 6) + hash(seller);
		console.log("addressSelling : " + addressSeller);
		console.log("getting paid via address : " + address);
		privateKeyStrBuf = "7122744c74d6193bde45787812b91f0447e9cda4a8e6ea257067f17f65427956";
		privateKeyStr = privateKeyStrBuf.toString().trim();
		privateKey = Secp256k1PrivateKey.fromHex(privateKeyStr);
		signer = new CryptoFactory(context).newSigner(privateKey);
		let keyGenerated = process.argv[4];
		let iv = process.argv[5];
		payload = {
			action: "terminate",
			address: address,
			key: keyGenerated,
			iv: iv
		};
		console.log("signer : " + signer.getPublicKey().asHex());
		sendBatch(payload, signer, [address, addressSeller], [address, addressSeller]);
	} else {
		console.log("Lol ok bye.");
	}
	break;
    case "pay":
	if (process.argv[3]) {
		address = process.argv[3];
		addressBuyer = hash("wtr-transaction-family").substring(0, 6) + hash(buyer);
		console.log("addressBuyer : " + addressBuyer);
		console.log("paying address : " + address);
		privateKeyStrBuf = "161c920b77b770d2bc3e53db93544da6af964445b2f5a123d406bff9ac0ee7f1";
		privateKeyStr = privateKeyStrBuf.toString().trim();
		privateKey = Secp256k1PrivateKey.fromHex(privateKeyStr);
		signer = new CryptoFactory(context).newSigner(privateKey);
		let keyGenerated = Buffer.from(_generateNewKey(32)).toString('base64');
		let iv = Buffer.from(_generateNewKey(16)).toString('base64');
console.log("Key generated : " + keyGenerated);
console.log("iv generated : " + iv);
		payload = {
			action: "pay",
			address: address,
			key: keyGenerated,
			iv: iv
		};
		console.log("signer : " + signer.getPublicKey().asHex());
		sendBatch(payload, signer, [address, addressBuyer], [address, addressBuyer]);
	} else {
		throw new InternamError("Lol ok bye");
	}
	break;
    case "mint2":
    case "mint1":
    case "mint":
        if (process.argv[3] && !isNaN(process.argv[3])) {
let user;
if (process.argv[2] === 'mint2') {
		address = hash("wtr-transaction-family").substring(0, 6) + hash(bidder2);
		user = bidder2;
} else if (process.argv[2] === 'mint1') {
		address = hash("wtr-transaction-family").substring(0, 6) + hash(bidder1);
		user = bidder1;
} else {
		address = hash("wtr-transaction-family").substring(0, 6) + hash(buyer);
		user = buyer;
}
		privateKeyStrBuf = "40c14fa8090eb01d984f85c4e7a57bc9db77c4aec75691e729a7924c20d563ea";
		console.log("address : " + address);
		privateKeyStr = privateKeyStrBuf.toString().trim();
		privateKey = Secp256k1PrivateKey.fromHex(privateKeyStr);
		signer = new CryptoFactory(context).newSigner(privateKey)
		payload = {
			action: "mint",
			user: user,
			coins: parseInt(process.argv[3]) 
		};
		console.log("signer : " + signer.getPublicKey().asHex());
		sendBatch(payload, signer, [address], [address]);
	} else
		throw new InternalError("Lol ok bye");
	break;
    case "newTransaction":
        if (process.argv[3] && !isNaN(process.argv[3])) {
		const address = hash("wtr-transaction-family").substring(0, 6) + hash(seller).substring(0, 28) + hash(buyer).substring(0, 28) + hash(nonce).substring(0, 8);
		console.log("address : " + address);
		privateKeyStrBuf = "8ab4eb6397fca2cb2e32147e83b4b74cd86c515973e199daccdb2a18baddfd70";
		privateKeyStr = privateKeyStrBuf.toString().trim();
		privateKey = Secp256k1PrivateKey.fromHex(privateKeyStr);
		signer = new CryptoFactory(context).newSigner(privateKey)
            	payload = {
                	action: "newTransaction",
			seller: seller,
			buyer: buyer,
	                total: parseInt(process.argv[3]),
			nonce: nonce
        	    };

		sendBatch(payload, signer, [address], [address]);
        } else
            throw new InternalError("Lol ok bye");
        break;
    default:
        throw new InternalError("Ok bye");
}

function sendBatch(payload, signer, listInputs, listOutputs) {
            const payloadBytes = cbor.encode(payload);  

            const transactionHeaderBytes = protobuf.TransactionHeader.encode({
                familyName: 'wtr-transaction-family',
                familyVersion: '1.0',
		inputs: listInputs,
		outputs: listOutputs,
                signerPublicKey: signer.getPublicKey().asHex(),
                nonce: nonce,
                batcherPublicKey: signer.getPublicKey().asHex(),
                dependencies: [],
                payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
            }).finish()

            let signature = signer.sign(transactionHeaderBytes)

            const transaction = protobuf.Transaction.create({
                header: transactionHeaderBytes,
                headerSignature: signature,
                payload: payloadBytes
            })

            const transactions = [transaction]

            const batchHeaderBytes = protobuf.BatchHeader.encode({
                signerPublicKey: signer.getPublicKey().asHex(),
                transactionIds: transactions.map((txn) => txn.headerSignature),
            }).finish()

            signature = signer.sign(batchHeaderBytes);

            const batch = protobuf.Batch.create({
                header: batchHeaderBytes,
                headerSignature: signature,
                transactions: transactions
            })

            const batchListBytes = protobuf.BatchList.encode({
                batches: [batch]
            }).finish()

            request.post({
                url: 'http://127.0.0.1:8008/batches',
                body: batchListBytes,
                headers: {'Content-Type': 'application/octet-stream'}
            }, (err, response) => {
                if (err) return console.log(err)
                console.log(response.body)
            })
}

function getBalance() {
    fetch('http://127.0.0.1:8008/state/' + address, {
        method: 'GET',
    })
        .then((response) => response.json())
        .then((responseJson) => {
            var data = responseJson.data;
            if (data) {
                var amount = new Buffer.from(data, 'base64').toString();
                console.log(amount);
            }
        })
        .catch((error) => {
            console.error(error);
        });
}
