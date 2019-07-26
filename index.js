const fetch = require('node-fetch');
const { createHash } = require('crypto');
const {protobuf} = require('sawtooth-sdk')
const request = require('request');
const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1')	
const { InternalError } = require('sawtooth-sdk').exceptions;
const cbor = require('cbor');

const hash = (x) => createHash('sha512').update(x).digest('hex').toLocaleLowerCase().substring(0, 64);

const buyer = '02e659e17d68b1b2acce003a363f36a4ca87306a86032e2e97ca6aa65fe5494578';
const seller = '0218813b59d6d85f1afe317161bdae538baef6835c6ca6217447bee142dac4dd4a';

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
    case "pay":
	if (process.argv[3]) {
		address = process.argv[3];
		addressBuyer = hash("wtr-transaction-family").substring(0, 6) + hash(buyer);
		console.log("addressBuyer : " + addressBuyer);
		console.log("paying address : " + address);
		privateKeyStrBuf = "e676921407435df95f7ebd951b60ddb999f2ce981b07ce140c3f6924f1f15bba";
		privateKeyStr = privateKeyStrBuf.toString().trim();
		privateKey = Secp256k1PrivateKey.fromHex(privateKeyStr);
		signer = new CryptoFactory(context).newSigner(privateKey)
		payload = {
			action: "pay",
			address: address
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
		privateKeyStrBuf = "2ca98132f6ae059a55919812097babbd31a75cc2a885220eb526199de7eb4f3b";
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
		privateKeyStrBuf = "94478e0b3b1cfbe59556df1d7df721aeb621e25c9a457477c07eb931686b4d60";
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
