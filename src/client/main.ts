import {
  establishConnection,
  establishPayer,
  checkProgram,
  passData,
  getResult,
} from './computation';
import {question} from 'readline-sync'; //npm install --save readline-sync || npm i --save-dev @types/readline-sync

let first_number: String = "a";
let second_number: String = "a";
let operation: String = "a";
let is_set_op: Boolean = false;

async function main() {
  console.log("MODULE 4 - FINAL PROJECT");
  await establishConnection();
  await establishPayer();
  await checkProgram();

  let view_last = question("View previous answer? Y/N >> ");
  if(view_last === "Y" || view_last === "y") {
    await getResult();
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
    
  await passData(first_number, second_number, operation);
  await getResult();

  console.log('Success');
}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);