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
import {ServiceEndpoint, SolData, SolPublicKey, VerificationMethod} from "@identity.com/sol-did-client";

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
    const id = props.ix.data;
    const code = parseDidSolInstructionCode(props.ix);
    const title = codeToTitle(code);
    const created = parseDidSolInstruction(code, props.ix);
    return <DidSolInstruction title={title} info = {created}  {...props}/> ;
  } catch (err) {
    reportError(err, {});
    return <UnknownDetailsCard {...props} />;
  }
}

type InfoProps = {
  ix: TransactionInstruction;
  info: {[key: string]: any};
  result: SignatureResult;
  index: number;
  title: string;
};

function parseDidSolInstruction(code: DidSolInstructionType, ix: TransactionInstruction): {[key: string]: any} {
  switch (code) {
    case DidSolInstructionType.Initialize:
      const solData = SolData.decode<SolData>(ix.data.slice(9,));
      const {account, cluster, ...result} = { 
        Funder: ix.keys[0].pubkey,
        DataAccount: ix.keys[1].pubkey,
        AuthorityAccount: ix.keys[2].pubkey,
        RentAccount: ix.keys[3].pubkey,
        SystemAccount: ix.keys[4].pubkey,
        ...solData
      };
      return result
    case DidSolInstructionType.Write:
      return {
        DataAccount: ix.keys[0].pubkey,
        AuthorityAccount: ix.keys[1].pubkey,
      }
    case DidSolInstructionType.CloseAccount:
      return {
        DataAccount: ix.keys[0].pubkey,
        AuthorityAccount: ix.keys[1].pubkey,
        ReceiverAccount: ix.keys[2].pubkey,
      }
  }
}
function display(value: any): JSX.Element {
  if (Array.isArray(value)) {
    return <ul style ={{listStyle:'none'}}>
          {value.map(val => <li className="text-end">{display(val)}</li>)}
      </ul>
  } else if (value instanceof PublicKey) {
      return <Address pubkey={value} alignRight link />
  } else if (value instanceof SolPublicKey) {
    return <Address pubkey={value.toPublicKey()} alignRight link />
  } else if (typeof value === "string") {
    return <>{value}</>
  } else if (typeof value === "number") {
    return <>{value}</>
  } else if (value instanceof VerificationMethod) {
    return <ul style ={{listStyle:'none'}}>
    <li>{value.id}</li>
    <li><Address pubkey={value.pubkey.toPublicKey()} alignRight link /></li>
    <li>{value.verificationType}</li>
    </ul>
  } else if (value instanceof ServiceEndpoint) {
    return< ul style ={{listStyle:'none'}}>
    <li>{value.id}</li>
    <li>{value.endpointType}</li>
    <li>{value.endpoint}</li>
    <li>{value.description}</li>
    </ul>
  } else {
    return <>Not available</>
  }
}

function DidSolInstruction(props: InfoProps) {
  const attributes = Object.entries(props.info).filter(([key, val]) => (!Array.isArray(val) || !(val.length ===0))).map(([key, val]) => {
    let label = key.charAt(0).toUpperCase() + key.slice(1) + '';
    return <tr key={key}>
      <td>{label}</td>
      <td className="text-end" >{display(val)}</td>
    </tr>
  })
  return (
    <InstructionCard
      ix={props.ix}
      index={props.index}
      result={props.result}
      title={props.title}
    > {attributes}</InstructionCard>
  );
}
