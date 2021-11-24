//! Example Rust-based BPF program that exercises instruction introspection

extern crate solana_program;
use solana_program::{
    account_info::next_account_info,
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    instruction::{AccountMeta, Instruction},
    msg,
    program::invoke,
    program_error::ProgramError,
    pubkey::Pubkey,
    sysvar::instructions,
};

entrypoint!(process_instruction);
fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    if instruction_data.is_empty() {
        return Err(ProgramError::InvalidAccountData);
    }

    let secp_instruction_index = instruction_data[0];
    let account_info_iter = &mut accounts.iter();
    let instruction_accounts = next_account_info(account_info_iter)?;
    assert_eq!(*instruction_accounts.key, instructions::id());
    let data_len = instruction_accounts.try_borrow_data()?.len();
    if data_len < 2 {
        return Err(ProgramError::InvalidAccountData);
    }

    let instruction = instructions::load_instruction_at_checked(
        secp_instruction_index as usize,
        instruction_accounts,
    )
    .map_err(|_| ProgramError::InvalidAccountData)?;

    let current_instruction =
        instructions::load_current_index(&instruction_accounts.try_borrow_data()?);
    let my_index = instruction_data[1] as u16;
    assert_eq!(current_instruction, my_index);

    msg!(&format!("id: {}", instruction.program_id));

    msg!(&format!("data[0]: {}", instruction.data[0]));
    msg!(&format!("index: {}", current_instruction));

    if instruction_data.len() == 2 {
        // CPI ourself with the same arguments to confirm the instructions sysvar reports the same
        // results from within a CPI
        invoke(
            &Instruction::new_with_bytes(
                *program_id,
                &[instruction_data[0], instruction_data[1], 1],
                vec![AccountMeta::new_readonly(instructions::id(), false)],
            ),
            &[instruction_accounts.clone()],
        )?;
    }

    Ok(())
}
