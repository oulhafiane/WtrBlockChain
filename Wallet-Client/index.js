const fetch = require('node-fetch');
const cbor = require('cbor')
const { createHash } = require('crypto');
const {protobuf} = require('sawtooth-sdk')
const request = require('request');
const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const { Secp256k1PrivateKey } = require('sawtooth-sdk/signing/secp256k1')	
const { InternalError } = require('sawtooth-sdk').exceptions;

const hash = (x) => createHash('sha512').update(x).digest('hex').toLocaleLowerCase().substring(0, 64);

const context = createContext('secp256k1')
const privateKeyStrBuf = "03ceccecc4e8c760180bc6e3ed0ef310e653667214e0bce814ddb3fbfe3fa19f";
const privateKeyStr = privateKeyStrBuf.toString().trim();
const privateKey = Secp256k1PrivateKey.fromHex(privateKeyStr);
const signer = new CryptoFactory(context).newSigner(privateKey)
const address = hash("wallet-family").substring(0, 6) + hash(signer.getPublicKey().asHex());


switch (process.argv[2]) {
    case "balance":
        getBalance();
        break;
    case "deposit":
        if (process.argv[3] && !isNaN(process.argv[3])) {
            const payload = {
                action: "deposit",
                amount: parseInt(process.argv[3])
            }

            const payloadBytes = cbor.encode(payload)

            const transactionHeaderBytes = protobuf.TransactionHeader.encode({
                familyName: 'wallet-family',
                familyVersion: '1.0',
                inputs: ['1cf1266e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7'],
                outputs: ['1cf1266e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7'],
                signerPublicKey: signer.getPublicKey().asHex(),
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
        } else
            throw new InternalError("Lol ok bye");
        break;
    default:
        throw new InternalError("Ok bye");
}

function getBalance() {
    fetch('http://127.0.0.1:8008/state/' + address, {
        method: 'GET',
    })
        .then((response) => response.json())
        .then((responseJson) => {
            var data = responseJson.data;
            console.log(data);
            if (data) {
                var amount = new Buffer.from(data, 'base64').toString();
                console.log(amount);
            }
        })
        .catch((error) => {
            console.error(error);
        });
}