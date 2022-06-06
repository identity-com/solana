import React from "react";
import {
  SignatureResult,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";

import { UnknownDetailsCard } from "../UnknownDetailsCard";
import { InstructionCard } from "../InstructionCard";
// import { Address } from "components/common/Address";
import { reportError } from "utils/sentry";
// import {I} from "@identity.com/sol-did-client";

type DetailsProps = {
  ix: TransactionInstruction;
  result: SignatureResult;
  index: number;
  innerCards?: JSX.Element[];
  childIndex?: number;
};

// function parseGatewayInstruction(code: GatewayInstructionType, ix: TransactionInstruction) {
//   const {issueVanilla, updateExpiry, setState} = GatewayInstruction.decode<GatewayInstruction>(ix.data);
//
// }


// Converts a Borsh-deserialised "Enum" (an object with one populated
// property and the rest undefined) to a string

export function DidSolDetailsCard(props: DetailsProps) {
  try {
    // const code = parseGatewayInstructionCode(props.ix);
    const title = "did:sol Write"
    // const title = codeToTitle(code)
    // const created = parseGatewayInstruction(code, props.ix);
    // console.log({code, title, created, data: props.ix.data.toJSON()});
    return <DidSolInstruction title={title} {...props} />;
  } catch (err) {
    reportError(err, {});
    return <UnknownDetailsCard {...props} />;
  }
}

type InfoProps = {
  ix: TransactionInstruction;
  // info: any;
  result: SignatureResult;
  index: number;
  title: string;
};

function DidSolInstruction(props: InfoProps) {
  // const attributes: JSX.Element[] = [];


  return (
    <InstructionCard
      ix={props.ix}
      index={props.index}
      result={props.result}
      title={props.title}
    />
  );
}
