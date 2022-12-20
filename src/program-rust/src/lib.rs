use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ComputationResult {
    pub answer: u32,
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("MODULE 4 - FINAL PROJECT [MING MANANGAN]");

    let accounts_iter = &mut accounts.iter();

    let account = next_account_info(accounts_iter)?;

    if account.owner != program_id {
        msg!("INCORRECT PROGRAM ID");
        return Err(ProgramError::IncorrectProgramId);
    }

    let instruction_data_string = String::from_utf8(instruction_data.to_vec()).unwrap();
    let instruction_data_string_split: Vec<_> = instruction_data_string.split(' ').collect();
    let num1 = instruction_data_string_split[0].parse::<u32>().unwrap();
    let num2 = instruction_data_string_split[1].parse::<u32>().unwrap();

    let ans: u32 = match instruction_data_string_split[2] {
        "+" => num1 + num2,
        "-" => num1 - num2,
        _ => 0,
    };

    let mut greeting_account = ComputationResult::try_from_slice(&account.data.borrow())?;
    greeting_account.answer = ans;
    greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;

    msg!("FIRST NUMBER: {} || SECOND NUMBER: {} || OPERATION: {} || ANSWER: {}", instruction_data_string_split[0], instruction_data_string_split[1], instruction_data_string_split[2], ans);

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
            ComputationResult::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            0
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(
            ComputationResult::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            1
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(
            ComputationResult::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .counter,
            2
        );
    }
}
