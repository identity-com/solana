import { TransactionInstruction } from "@solana/web3.js";
import { SOL_DID_PROGRAM_ID } from "../../../providers/accounts";

export const isDidSolInstruction = (instruction: TransactionInstruction) => {
  console.log(
    "isDidSolInstruction",
    SOL_DID_PROGRAM_ID.equals(instruction.programId)
  );
  return SOL_DID_PROGRAM_ID.equals(instruction.programId);
};
