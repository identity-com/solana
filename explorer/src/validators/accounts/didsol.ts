/* eslint-disable @typescript-eslint/no-redeclare */

import { ClusterType, ServiceEndpoint, SolPublicKey, VerificationMethod } from "@identity.com/sol-did-client/dist/lib/solana/sol-data";
import {
    Infer,
    enums,
    type,
    number,
    optional,
    string,
    array
  } from "superstruct";
  import { PublicKeyFromString} from "validators/pubkey";
  
  export type DidSolTokenAccountInfo = Infer<typeof DidSolTokenAccountInfo>
  export const DidSolTokenAccountInfo = type ({
    account: PublicKeyFromString,
    authority: PublicKeyFromString,
    accountVersion: number(),
    version: string(),
    controller: array(PublicKeyFromString),
    //verificationMethod: VerificationMethod[],
    authentication: array(string()),
    capabilityInvocation: array(string()),
    capabilityDelegation: array(string()),
    keyAgreement: array(string()),
    assertionMethod: array(string()),
    //service: ServiceEndpoint[],
  })

  export type DidSolTokenAccount = Infer<typeof DidSolTokenAccount>;
  export const DidSolTokenAccount = type ({
      info: DidSolTokenAccountInfo
  })
  