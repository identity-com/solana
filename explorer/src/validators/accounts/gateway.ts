/* eslint-disable @typescript-eslint/no-redeclare */

import { Infer, enums, type, number, optional } from "superstruct";
import { PublicKeyFromString } from "validators/pubkey";
import { literal } from "superstruct/lib/index.es";

export type GatewayTokenAccountState = Infer<typeof AccountState>;
const AccountState = enums(["ACTIVE", "FROZEN", "REVOKED"]);

export type GatewayTokenAccountInfo = Infer<typeof GatewayTokenAccountInfo>;
export const GatewayTokenAccountInfo = type({
  issuingGatekeeper: PublicKeyFromString,
  owner: PublicKeyFromString,
  gatekeeperNetwork: PublicKeyFromString,
  state: AccountState,
  expiryTime: optional(number()),
});

export type GatewayTokenAccount = Infer<typeof GatewayTokenAccount>;
export const GatewayTokenAccount = type({
  type: literal("gatewayToken"),
  info: GatewayTokenAccountInfo,
});
