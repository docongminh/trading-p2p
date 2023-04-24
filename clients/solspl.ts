import * as anchor from "@project-serum/anchor";

import { TradeP2P } from "./p2p";
import {
  CancelParams,
  PartnerInfo,
  TradeInfo,
  TradeOrderRequest,
  TradeType,
} from "./p2p";
import { setup } from "./setup";

async function createTradeSolSpl(
  connection: anchor.web3.Connection,
  orderId: number,
  tradeValue: number,
  receivevalue: number,
  tradeInstance: TradeP2P,
  receiveMintAddress: anchor.web3.PublicKey,
  tradeCreator: anchor.web3.Keypair,
  creatorReceiveTokenAccount: anchor.web3.PublicKey
): Promise<string> {
  const tradeOrder: TradeOrderRequest = {
    creator: tradeCreator.publicKey,
    orderId: orderId,
    tradeValue: tradeValue,
    receiveValue: receivevalue,
    creatorSendAccount: tradeCreator.publicKey,
    creatorReceiveAccount: creatorReceiveTokenAccount,
    receiveMint: receiveMintAddress,
    timestamp: Date.now().toString(),
    tradeType: TradeType.SOLSPL,
  };

  const buffer = await tradeInstance.createTrade(tradeOrder);
  const transaction = anchor.web3.Transaction.from(Buffer.from(buffer));
  const signature = await connection.sendTransaction(transaction, [
    tradeCreator,
  ]);
  return signature;
}

async function cancelTradeSolSpl(
  connection: anchor.web3.Connection,
  orderId: number,
  tradeInstance: TradeP2P,
  receiveMintAddress: anchor.web3.PublicKey,
  tradeCreator: anchor.web3.Keypair
): Promise<string> {
  const cancelParams: CancelParams = {
    orderId: orderId,
    creator: tradeCreator.publicKey,
    creatorSendAccount: tradeCreator.publicKey,
    tradeType: TradeType.SOLSPL,
    tradeMint: receiveMintAddress,
  };
  const cancelRawTransaction = await tradeInstance.cancel(cancelParams);
  const cancelTransaction = anchor.web3.Transaction.from(
    Buffer.from(cancelRawTransaction)
  );
  const cancelSignature = await connection.sendTransaction(cancelTransaction, [
    tradeCreator,
  ]);
  console.log("Cancel SOL-SPL: ", cancelSignature);

  return cancelSignature;
}

(async () => {
  const {
    connection,
    tradeInstance,
    tokenA,
    tradeCreator,
    creatorTokenATokenAccount,
  } = await setup();
  const orderId = Math.floor(Math.random() * 10000);
  const tradeValue = 0.01 * anchor.web3.LAMPORTS_PER_SOL;
  const receivevalue = 10;
  const signature = await createTradeSolSpl(
    connection,
    orderId,
    tradeValue,
    receivevalue,
    tradeInstance,
    tokenA,
    tradeCreator,
    creatorTokenATokenAccount
  );

  console.log("signature create trade: ", signature);
})();
