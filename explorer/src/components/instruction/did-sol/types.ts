import { TransactionInstruction } from "@solana/web3.js";
import { SOL_DID_PROGRAM_ID } from "../../../providers/accounts";

export const isDidSolInstruction = (instruction: TransactionInstruction) => {
  return SOL_DID_PROGRAM_ID.equals(instruction.programId);
};
