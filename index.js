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

const buyer = '03ebaf5f2b20eb2dba78d3d57bbbda1d24d686845d50910d58f193c519820802f5';
const seller = '0281f6fd635f5e6190871354ba0794bad11bf312cbc700631b16dd3106834ba707';

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
    case "createOffer":
	if (process.argv[3] && process.argv[4]) {
		if (process.argv[4] === 'auction' && !process.argv[5])
			throw new InternalError("lol ok byee.");
		let period = null;
		if (process.argv[5])
			period = process.argv[5];
		console.log("period is : " + period);
		address = hash("wtr-transaction-family").substring(0, 6) + hash(process.argv[3]).substring(0, 64);
		addressBuyer = hash("wtr-transaction-family").substring(0, 6) + hash(buyer);
		addressParameters = hash("wtr-transaction-family").substring(0, 6) + hash('WtrParameters').substring(0, 64);
		console.log("addressBuyer : " + addressBuyer);
		console.log("offer address : " + address);
		privateKeyStrBuf = "2760b42b1fb2f6fb28315723a09279f95d7901f3a1fb2bd1a026e077bf142a27";
		privateKeyStr = privateKeyStrBuf.toString().trim();
		privateKey = Secp256k1PrivateKey.fromHex(privateKeyStr);
		signer = new CryptoFactory(context).newSigner(privateKey);
		payload = {
			action: "createOffer",
			offer: process.argv[3],
			type: process.argv[4],
			startDate: new Date(),
			period: period
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
		privateKeyStrBuf = "ec5c4a072f8afd6522726d7ded673db43c11cbc6c47d21df89e2a27ce1b0c8ed";
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
		privateKeyStrBuf = "2760b42b1fb2f6fb28315723a09279f95d7901f3a1fb2bd1a026e077bf142a27";
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
    case "mint":
        if (process.argv[3] && !isNaN(process.argv[3])) {
		address = hash("wtr-transaction-family").substring(0, 6) + hash(buyer);
		console.log("address : " + address);
		privateKeyStrBuf = "40c14fa8090eb01d984f85c4e7a57bc9db77c4aec75691e729a7924c20d563ea";
		privateKeyStr = privateKeyStrBuf.toString().trim();
		privateKey = Secp256k1PrivateKey.fromHex(privateKeyStr);
		signer = new CryptoFactory(context).newSigner(privateKey)
		payload = {
			action: "mint",
			user: buyer,
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
