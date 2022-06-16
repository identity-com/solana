/* eslint-disable @typescript-eslint/no-redeclare */

import {
  Infer,
  enums,
  type,
  number,
  optional,
  string,
  array,
} from "superstruct";
import { PublicKeyFromString } from "validators/pubkey";

export type DidSolTokenAccountInfo = Infer<typeof DidSolTokenAccountInfo>;
export const DidSolTokenAccountInfo = type({
  account: PublicKeyFromString,
  authority: PublicKeyFromString,
  accountVersion: number(),
  version: string(),
  controller: array(PublicKeyFromString),
  verificationID: array(string()),
  vertificationType: array(string()),
  vertificationPubkey: array(PublicKeyFromString),
  authentication: array(string()),
  capabilityInvocation: array(string()),
  capabilityDelegation: array(string()),
  keyAgreement: array(string()),
  assertionMethod: array(string()),
  serviceID: array(string()),
  serviceEndpointType: array(string()),
  serviceEndpoint: array(string()),
  serviceDescription: array(string()),
});

export type DidSolTokenAccount = Infer<typeof DidSolTokenAccount>;
export const DidSolTokenAccount = type({
  info: DidSolTokenAccountInfo,
});
