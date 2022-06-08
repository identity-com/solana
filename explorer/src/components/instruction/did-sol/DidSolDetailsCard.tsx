import React from "react";
import {
  SignatureResult,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";

import { UnknownDetailsCard } from "../UnknownDetailsCard";
import { InstructionCard } from "../InstructionCard";
import { Address } from "components/common/Address";
import { reportError } from "utils/sentry";
import { programLabel } from "utils/tx";
import { useCluster } from "providers/cluster";
import {  SolData} from "@identity.com/sol-did-client";

type DetailsProps = {
  ix: TransactionInstruction;
  result: SignatureResult;
  index: number;
  innerCards?: JSX.Element[];
  childIndex?: number;
};

enum DidSolInstructionType {
  Initialize,
  Write,
  CloseAccount,
}

const parseDidSolInstructionCode = (ix: TransactionInstruction): DidSolInstructionType => ix.data.slice(0, 1).readUInt8(0);

const codeToTitle = (code: DidSolInstructionType) => {
  switch (code) {
    case DidSolInstructionType.Initialize: return "Initialize";
    case DidSolInstructionType.Write: return "Write";
    case DidSolInstructionType.CloseAccount: return "Close Account";
  }
}

export function DidSolDetailsCard(props: DetailsProps) {
  try {
    const code = parseDidSolInstructionCode(props.ix);
    const title = codeToTitle(code);
    const created = parseDidSolInstruction(code, props.ix);
    return <DidSolInstruction title={title} info = {created}  {...props}/> ;
  } catch (err) {
    reportError(err, {});
    console.log(1);
    return <UnknownDetailsCard {...props} />;
  }
}

type InfoProps = {
  ix: TransactionInstruction;
  info: any;
  result: SignatureResult;
  index: number;
  title: string;
};

function parseDidSolInstruction(code: DidSolInstructionType, ix: TransactionInstruction) {
  switch (code) {
    case DidSolInstructionType.Initialize:
      return { 
        Funder: ix.keys[0].pubkey,
        DataAccount: ix.keys[1].pubkey,
        Authority: ix.keys[2].pubkey,
        RentAccount: ix.keys[3].pubkey,
        SystemAccount: ix.keys[4].pubkey,
      };
    case DidSolInstructionType.Write:
      return {
        SolAccount: ix.keys[0].pubkey,
        SolSignerAuthority: ix.keys[1].pubkey,
      }
    case DidSolInstructionType.CloseAccount:
      return {
        SolAccount: ix.keys[0].pubkey,
        SolSignerAuthority: ix.keys[1].pubkey,
        ReceiverAccount: ix.keys[2].pubkey,
      }
  }


}

function DidSolInstruction(props: InfoProps) {
   const attributes: JSX.Element[] = [];

   for (let key in props.info) {
     let value = props.info[key];

 
     let tag;
     let labelSuffix = "";
     console.log(key, value);
     tag = <Address pubkey={value} alignRight link />;
 
     let label = key.charAt(0).toUpperCase() + key.slice(1) + labelSuffix;
     console.log(key)
     attributes.push(
       <tr key={key}>
         <td>{label}</td>
         <td className="text-lg-right">{tag}</td>
       </tr>
     );
   }
  return (
    <InstructionCard
      ix={props.ix}
      index={props.index}
      result={props.result}
      title={props.title}
    > {attributes}</InstructionCard>
  );
}
