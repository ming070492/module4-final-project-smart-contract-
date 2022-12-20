import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import fs from 'mz/fs';
import path from 'path';
import * as borsh from 'borsh';

import {getPayer, getRpcUrl, createKeypairFromFile} from './utils';

let connection: Connection;

let payer: Keypair;

let programId: PublicKey;

let resultStorageAccountPubkey: PublicKey;

const PROGRAM_PATH = path.resolve(__dirname, '../../dist/program');

const PROGRAM_SO_PATH = path.join(PROGRAM_PATH, 'calculator.so');

const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'calculator_keypair.json');

class ComputationResult {
  answer = 0;
  constructor(fields: {answer: number} | undefined = undefined) {
    if (fields) {
      this.answer = fields.answer;
    }
  }
}

const ComputationResultSchema = new Map([
  [ComputationResult, {kind: 'struct', fields: [['answer', 'u32']]}],
]);

const USER_INPUT_SIZE = borsh.serialize(
  ComputationResultSchema,
  new ComputationResult(),
).length;

export async function establishConnection(): Promise<void> {
  const rpcUrl = await getRpcUrl();
  connection = new Connection(rpcUrl, 'confirmed');
  const version = await connection.getVersion();
  console.log('Connection to cluster established:', rpcUrl, version);
}

export async function establishPayer(): Promise<void> {
  let fees = 0;
  if (!payer) {
    const {feeCalculator} = await connection.getRecentBlockhash();
    fees += await connection.getMinimumBalanceForRentExemption(USER_INPUT_SIZE);
    fees += feeCalculator.lamportsPerSignature * 100;
    payer = await getPayer();
  }

  let lamports = await connection.getBalance(payer.publicKey);
  if (lamports < fees) {
    const sig = await connection.requestAirdrop(
      payer.publicKey,
      fees - lamports,
    );
    await connection.confirmTransaction(sig);
    lamports = await connection.getBalance(payer.publicKey);
  }

  console.log(
    'PAYER: ',
    payer.publicKey.toBase58(),
    '[BAL: ',
    lamports / LAMPORTS_PER_SOL,
    'SOL]',
  );
}

export async function checkProgram(): Promise<void> {
  try {
    const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH);
    programId = programKeypair.publicKey;
  } catch (err) {
    const errMsg = (err as Error).message;
    throw new Error(
      `Failed to read program keypair at '${PROGRAM_KEYPAIR_PATH}' due to error: ${errMsg}. Program may need to be deployed.`,
    );
  }

  const programInfo = await connection.getAccountInfo(programId);
  if (programInfo === null) {
    if (fs.existsSync(PROGRAM_SO_PATH)) {
      throw new Error(
        'Program needs to be deployed',
      );
    } else {
      throw new Error('Program needs to be built and deployed');
    }
  } else if (!programInfo.executable) {
    throw new Error(`Program is not executable`);
  }
  console.log(`PROGRAM ID: ${programId.toBase58()}`);

  const COMPUTATION_SEED = 'hello';
  resultStorageAccountPubkey = await PublicKey.createWithSeed(
    payer.publicKey,
    COMPUTATION_SEED,
    programId,
  );

  const resutlStorageAccount = await connection.getAccountInfo(resultStorageAccountPubkey);
  if (resutlStorageAccount === null) {
    console.log(
      'Creating account',
      resultStorageAccountPubkey.toBase58(),
      'to store data input from the user',
    );
    const lamports = await connection.getMinimumBalanceForRentExemption(
      USER_INPUT_SIZE,
    );

    const transaction = new Transaction().add(
      SystemProgram.createAccountWithSeed({
        fromPubkey: payer.publicKey,
        basePubkey: payer.publicKey,
        seed: COMPUTATION_SEED,
        newAccountPubkey: resultStorageAccountPubkey,
        lamports,
        space: USER_INPUT_SIZE,
        programId,
      }),
    );
    await sendAndConfirmTransaction(connection, transaction, [payer]);
  }
}

export async function passData(num1: any, num2: any, op: any): Promise<void> {
  let instruction_data_received = num1 + " " + num2 + " " + op;
  console.log('PASSING INSTRUCTION DATA TO: ', programId.toBase58());
  const instruction = new TransactionInstruction({
    keys: [{pubkey: resultStorageAccountPubkey, isSigner: false, isWritable: true}],
    programId,
    data: Buffer.from(instruction_data_received, "utf-8"),
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer],
  );
}

export async function getResult(): Promise<void> {
  const storageAccountInfo = await connection.getAccountInfo(resultStorageAccountPubkey);
  if (storageAccountInfo === null) {
    throw 'Error: cannot find the greeted account';
  }
  const result = borsh.deserialize(
    ComputationResultSchema,
    ComputationResult,
    storageAccountInfo.data,
  );
  console.log(
    'ANSWER: ',
    result.answer
  );
}
