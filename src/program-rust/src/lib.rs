use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

/// Define the type of state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GreetingAccount {
    /// number of greetings
    pub answer: String,
}

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

//solana program deploy dist/program/helloworld.so
// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey, // Public key of the account the hello world program was loaded into
    accounts: &[AccountInfo], // The account to say hello to
    instruction_data: &[u8], // Ignored, all helloworld instructions are hellos
) -> ProgramResult {
    msg!("MODULE 4 - FINAL PROJECT [MING MANANGAN]");

    // Iterating accounts is safer than indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account to say hello to
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("Greeted account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }
    
    //This will store all the data in the blockchain
    let data = &mut &mut account.data.borrow_mut();
    data[..instruction_data.len()].copy_from_slice(&instruction_data);

    //let msg = GreetingAccount::deserialize(&mut instruction_data[..])?;
    //msg!("INSTRUCTION DATA: {}", instruction_data.to_string());
    //let mut data_received = GreetingAccount::try_from_slice(&account.data.borrow())?;
    //greeting_account.counter += 1;
    //greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;
    //let instruction_data_string = String::from_utf8(instruction_data).unwrap();
    //let instruction_data_string_split: Vec<_> = instruction_data_string.split('!').collect();
    /*let num1 = instruction_data_string_split[0].parse::<i32>().unwrap();
    let num2 = instruction_data_string_split[1].parse::<i32>().unwrap();

    let ans: i32 = match instruction_data_string_split[2] {
        "+" => num1 + num2,
        "-" => num1 - num2,
        _ => 0,
    };*/

    //let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?;
    //greeting_account.answer = ans.to_string();
    //greeting_account.answer = String::from("-1");
    //greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;

    //msg!("DATA RECEIVED: {:?}", instruction_data_vector[1]);
    //msg!("INSTRUCTION DATA: {:?}", instruction_data);
    //msg!("FIRST NUMBER: {} || SECOND NUMBER: {} || OPERATION: {} || ANSWER: {}", instruction_data_string_split[0], instruction_data_string_split[1], instruction_data_string_split[2], "G");

    Ok(())
}

// Sanity tests
#[cfg(test)]
mod test {
    use super::*;
    use solana_program::clock::Epoch;
    use std::mem;

    #[test]
    fn test_sanity() {
        let program_id = Pubkey::default();
        let key = Pubkey::default();
        let mut lamports = 0;
        let mut data = vec![0; mem::size_of::<i32>()];
        let owner = Pubkey::default();
        let account = AccountInfo::new(
            &key,
            false,
            true,
            &mut lamports,
            &mut data,
            &owner,
            false,
            Epoch::default(),
        );
        let instruction_data: Vec<u8> = Vec::new();

        let accounts = vec![account];

        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            0
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            1
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            2
        );
    }
}
