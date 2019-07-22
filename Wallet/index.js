const { TransactionProcessor } = require('sawtooth-sdk/processor');
const WalletHandler = require('./srcs/wallet_handler');

const transactionProcessor = new TransactionProcessor('tcp://localhost:4004');

transactionProcessor.addHandler(new WalletHandler());
transactionProcessor.start();