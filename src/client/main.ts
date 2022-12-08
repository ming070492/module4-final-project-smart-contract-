/**
 * Hello world
 */

 import {
  establishConnection,
  establishPayer,
  checkProgram,
  sayHello,
  reportGreetings,
} from './hello_world';
import {question} from 'readline-sync'; //npm install --save readline-sync || npm i --save-dev @types/readline-sync

let first_number: string = "a";
let second_number: string = "a";
let operation: string = "a";
let is_set_op: Boolean = false;

async function main() {
  console.log("MODULE 4 - FINAL PROJECT");
  // Establish connection to the cluster
  await establishConnection();

  // Determine who pays for the fees
  await establishPayer();

  // Check if the program has been deployed
  await checkProgram();

  let view_last = question("View previous computation? Y/N >> ");
  if(view_last === "Y" || view_last === "y") {
    await reportGreetings();
    return;
  }else{
    while(isNaN(first_number as any) || first_number === "") {
      first_number = question("ENTER FIRST NUMBER: ");
    }
    while(isNaN(second_number as any) || second_number === "") {
      second_number = question("ENTER SECOND NUMBER: ");
    }
    while(!is_set_op) {
      let op = question("Enter + for Addition\nEnter - for Subtraction\nENTER OPERATION: ");
      if(op === "+" || op === "-") {
        is_set_op = true;
        operation = op;
      }
    }
  }
    

  // Say hello to an account
  await sayHello(first_number, second_number, operation);

  // Find out how many times that account has been greeted
  await reportGreetings();
}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);