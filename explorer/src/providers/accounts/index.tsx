import React from "react";
import { pubkeyToString } from "utils";
import { AccountInfo, PublicKey, Connection, StakeActivationData } from "@solana/web3.js";
import { useCluster, Cluster } from "../cluster";
import { HistoryProvider } from "./history";
import { TokensProvider } from "./tokens";
import { create } from "superstruct";
import { ParsedInfo } from "validators";
import { StakeAccount } from "validators/accounts/stake";
import {
  TokenAccount,
  MintAccountInfo,
  TokenAccountInfo,
} from "validators/accounts/token";
import * as Cache from "providers/cache";
import { ActionType, FetchStatus } from "providers/cache";
import { reportError } from "utils/sentry";
import { VoteAccount } from "validators/accounts/vote";
import { NonceAccount } from "validators/accounts/nonce";
import { SysvarAccount } from "validators/accounts/sysvar";
import { ConfigAccount } from "validators/accounts/config";
import { FlaggedAccountsProvider } from "./flagged-accounts";
import {
  ProgramDataAccount,
  ProgramDataAccountInfo,
  UpgradeableLoaderAccount,
} from "validators/accounts/upgradeable-program";
import { RewardsProvider } from "./rewards";
import { programs, MetadataJson } from "@metaplex/js";
import getEditionInfo, { EditionInfo } from "./utils/getEditionInfo";
import { GatewayTokenAccount } from "../../validators/accounts/gateway";
import { GatewayToken, State as GatewayState, GatewayTokenData, GatewayTokenState } from "@identity.com/solana-gateway-ts";
import { SolData, SolDataConstructor } from "@identity.com/sol-did-client";
import { ClusterType } from "@identity.com/sol-did-client";
import { DidSolTokenAccount } from "validators/accounts/didsol";
export { useAccountHistory } from "./history";

const Metadata = programs.metadata.Metadata;

export type StakeProgramData = {
  program: "stake";
  parsed: StakeAccount;
  activation?: StakeActivationData;
};

export type UpgradeableLoaderAccountData = {
  program: "bpf-upgradeable-loader";
  parsed: UpgradeableLoaderAccount;
  programData?: ProgramDataAccountInfo;
};

export type NFTData = {
  metadata: programs.metadata.MetadataData;
  json: MetadataJson | undefined;
  editionInfo: EditionInfo;
};

export type TokenProgramData = {
  program: "spl-token";
  parsed: TokenAccount;
  nftData?: NFTData;
};

export type VoteProgramData = {
  program: "vote";
  parsed: VoteAccount;
};

export type NonceProgramData = {
  program: "nonce";
  parsed: NonceAccount;
};

export type SysvarProgramData = {
  program: "sysvar";
  parsed: SysvarAccount;
};

export type ConfigProgramData = {
  program: "config";
  parsed: ConfigAccount;
};

export type GatewayTokenProgramData = {
  program: "gateway";
  parsed: GatewayTokenAccount;
};

export type DidSolProgramData = {
  program: "didsol"
  parsed: DidSolTokenAccount;
  //todo
}

export type ProgramData =
  | UpgradeableLoaderAccountData
  | StakeProgramData
  | TokenProgramData
  | VoteProgramData
  | NonceProgramData
  | SysvarProgramData
  | ConfigProgramData
  | GatewayTokenProgramData
  | DidSolProgramData;

export interface Details {
  executable: boolean;
  owner: PublicKey;
  space: number;
  data?: ProgramData;
}

export interface Account {
  pubkey: PublicKey;
  lamports: number;
  details?: Details;
}

export const GATEWAY_PROGRAM_ID = new PublicKey("gatem74V238djXdzWnJf94Wo1DcnuGkfijbf3AuBhfs");
function fromGatewayTokenState(state: GatewayTokenState): GatewayState {
  if (!!state.active) return GatewayState.ACTIVE;
  if (!!state.revoked) return GatewayState.REVOKED;
  if (!!state.frozen) return GatewayState.FROZEN;

  throw new Error("Unrecognised state " + JSON.stringify(state));
}

export const SOL_DID_PROGRAM_ID = new PublicKey("idDa4XeCjVwKcprVAo812coUQbovSZ4kDGJf2sPaBnM");


type State = Cache.State<Account>;
type Dispatch = Cache.Dispatch<Account>;

const StateContext = React.createContext<State | undefined>(undefined);
const DispatchContext = React.createContext<Dispatch | undefined>(undefined);

type AccountsProviderProps = { children: React.ReactNode };
export function AccountsProvider({ children }: AccountsProviderProps) {
  const { url } = useCluster();
  const [state, dispatch] = Cache.useReducer<Account>(url);

  // Clear accounts cache whenever cluster is changed
  React.useEffect(() => {
    dispatch({ type: ActionType.Clear, url });
  }, [dispatch, url]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}> 
        <TokensProvider>
          <HistoryProvider>
            <RewardsProvider>
              <FlaggedAccountsProvider>{children}</FlaggedAccountsProvider>
            </RewardsProvider>
          </HistoryProvider>
        </TokensProvider>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}



function parseDidSolToken(result: AccountInfo<Buffer>, pubkey: PublicKey, cluster: Cluster): DidSolProgramData {
  const parsedData = SolData.decode<SolData>(result.data);
  const controllerKeys: PublicKey[] = [];
  parsedData.controller.map(val => controllerKeys.push(val.toPublicKey()));
  const serviceID: string[] = [];
  parsedData.service.map(val => serviceID.push(val.id));
  const serviceEndpoint: string[] = [];
  parsedData.service.map(val => serviceEndpoint.push(val.endpoint));
  const serviceEndpointType: string[] = [];
  parsedData.service.map(val => serviceEndpointType.push(val.endpointType));
  const serviceDescription: string[] = [];
  parsedData.service.map(val => serviceDescription.push(val.description));
  const verificationID: string[] = [];
  parsedData.verificationMethod.map(val => verificationID.push(val.id));
  const vertificationType: string[] = [];
  parsedData.verificationMethod.map(val => vertificationType.push(val.verificationType));
  const vertificationPubkey: PublicKey[] = [];
  parsedData.verificationMethod.map(val => vertificationPubkey.push(val.pubkey.toPublicKey()));
  const parsed = {
    account: parsedData.account.toPublicKey(),
    authority: parsedData.authority.toPublicKey(),
    accountVersion: parsedData.accountVersion,
    version: parsedData.version,
    controller: controllerKeys,
    serviceID: serviceID,
    serviceEndpointType: serviceEndpointType,
    serviceEndpoint: serviceEndpoint,
    serviceDescription: serviceDescription,
    authentication: parsedData.authentication,
    capabilityInvocation: parsedData.capabilityInvocation,
    capabilityDelegation: parsedData.capabilityDelegation,
    keyAgreement: parsedData.keyAgreement,
    assertionMethod: parsedData.assertionMethod,
    verificationID: verificationID,
    vertificationType: vertificationType,
    vertificationPubkey: vertificationPubkey,
  };
  return {
    program: "didsol",
    parsed: {info: parsed},
  }
}

function parseGatewayToken(result: AccountInfo<Buffer>, pubkey: PublicKey):GatewayTokenProgramData {
  const parsedData = GatewayTokenData.fromAccount(result.data);
  const parsed = new GatewayToken(
    parsedData.issuingGatekeeper.toPublicKey(),
    parsedData.gatekeeperNetwork.toPublicKey(),
    parsedData.owner.toPublicKey(),
    fromGatewayTokenState(parsedData.state),
    pubkey,
    GATEWAY_PROGRAM_ID,
    parsedData.expiry?.toNumber()
  );
  return {
    program: "gateway",
    parsed: {info: parsed},
  }
}

async function fetchAccountInfo(
  dispatch: Dispatch,
  pubkey: PublicKey,
  cluster: Cluster,
  url: string
) {
  dispatch({
    type: ActionType.Update,
    key: pubkey.toBase58(),
    status: Cache.FetchStatus.Fetching,
    url,
  });

  let data;
  let fetchStatus;
  try {
    const connection = new Connection(url, "confirmed");
    const result = (await connection.getParsedAccountInfo(pubkey)).value;

    let lamports, details;
    if (result === null) {
      lamports = 0;
    } else {
      lamports = result.lamports;

      // Only save data in memory if we can decode it
      let space: number;
      if (!("parsed" in result.data)) {
        space = result.data.length;
      } else {
        space = result.data.space;
      }

      let data: ProgramData | undefined;
      if ("parsed" in result.data) {
        try {
          const info = create(result.data.parsed, ParsedInfo);
          switch (result.data.program) {
            case "bpf-upgradeable-loader": {
              const parsed = create(info, UpgradeableLoaderAccount);

              // Fetch program data to get program upgradeability info
              let programData: ProgramDataAccountInfo | undefined;
              if (parsed.type === "program") {
                const result = (
                  await connection.getParsedAccountInfo(parsed.info.programData)
                ).value;
                if (
                  result &&
                  "parsed" in result.data &&
                  result.data.program === "bpf-upgradeable-loader"
                ) {
                  const info = create(result.data.parsed, ParsedInfo);
                  programData = create(info, ProgramDataAccount).info;
                } else {
                  throw new Error(
                    `invalid program data account for program: ${pubkey.toBase58()}`
                  );
                }
              }
              data = {
                program: result.data.program,
                parsed,
                programData,
              };
              break;
            }
            case "stake": {
              const parsed = create(info, StakeAccount);
              const isDelegated = parsed.type === "delegated";
              const activation = isDelegated
                ? await connection.getStakeActivation(pubkey)
                : undefined;

              data = {
                program: result.data.program,
                parsed,
                activation,
              };
              break;
            }
            case "vote":
              data = {
                program: result.data.program,
                parsed: create(info, VoteAccount),
              };
              break;
            case "nonce":
              data = {
                program: result.data.program,
                parsed: create(info, NonceAccount),
              };
              break;
            case "sysvar":
              data = {
                program: result.data.program,
                parsed: create(info, SysvarAccount),
              };
              break;
            case "config":
              data = {
                program: result.data.program,
                parsed: create(info, ConfigAccount),
              };
              break;

            case "spl-token":
              const parsed = create(info, TokenAccount);
              let nftData;

              try {
                // Generate a PDA and check for a Metadata Account
                if (parsed.type === "mint") {
                  const metadata = await Metadata.load(
                    connection,
                    await Metadata.getPDA(pubkey)
                  );
                  if (metadata) {
                    // We have a valid Metadata account. Try and pull edition data.
                    const editionInfo = await getEditionInfo(
                      metadata,
                      connection
                    );
                    const id = pubkeyToString(pubkey);
                    const metadataJSON = await getMetaDataJSON(
                      id,
                      metadata.data
                    );
                    nftData = {
                      metadata: metadata.data,
                      json: metadataJSON,
                      editionInfo,
                    };
                  }
                }
              } catch (error) {
                // unable to find NFT metadata account
              }

              data = {
                program: result.data.program,
                parsed,
                nftData,
              };
              break;
            default:
              console.log("unrecognised program");
              console.log(info);
              data = undefined;
          }
        } catch (error) {
          reportError(error, { url, address: pubkey.toBase58() });
        }
      } else {
        if (result.owner.equals(GATEWAY_PROGRAM_ID)) {
          data = parseGatewayToken(result as AccountInfo<Buffer>, pubkey);
        } 
        else if (result.owner.equals(SOL_DID_PROGRAM_ID)) {
          data = parseDidSolToken(result as AccountInfo<Buffer>, pubkey, cluster);
        }
      }
      details = {
        space,
        executable: result.executable,
        owner: result.owner,
        data,
      };
    }
    data = { pubkey, lamports, details };
    fetchStatus = FetchStatus.Fetched;
  } catch (error) {
    if (cluster !== Cluster.Custom) {
      reportError(error, { url });
    }
    fetchStatus = FetchStatus.FetchFailed;
  }
  dispatch({
    type: ActionType.Update,
    status: fetchStatus,
    data,
    key: pubkey.toBase58(),
    url,
  });
}

const getMetaDataJSON = async (
  id: string,
  metadata: programs.metadata.MetadataData
): Promise<MetadataJson | undefined> => {
  return new Promise(async (resolve, reject) => {
    const uri = metadata.data.uri;
    if (!uri) return resolve(undefined);

    const processJson = (extended: any) => {
      if (!extended || extended?.properties?.files?.length === 0) {
        return;
      }

      if (extended?.image) {
        extended.image = extended.image.startsWith("http")
          ? extended.image
          : `${metadata.data.uri}/${extended.image}`;
      }

      return extended;
    };

    try {
      fetch(uri)
        .then(async (_) => {
          try {
            const data = await _.json();
            try {
              localStorage.setItem(uri, JSON.stringify(data));
            } catch {
              // ignore
            }
            resolve(processJson(data));
          } catch {
            resolve(undefined);
          }
        })
        .catch(() => {
          resolve(undefined);
        });
    } catch (ex) {
      console.error(ex);
      resolve(undefined);
    }
  });
};

export function useAccounts() {
  const context = React.useContext(StateContext);
  if (!context) {
    throw new Error(`useAccounts must be used within a AccountsProvider`);
  }
  return context.entries;
}

export function useAccountInfo(
  address: string | undefined
): Cache.CacheEntry<Account> | undefined {
  const context = React.useContext(StateContext);

  if (!context) {
    throw new Error(`useAccountInfo must be used within a AccountsProvider`);
  }
  if (address === undefined) return;
  return context.entries[address];
}

export function useMintAccountInfo(
  address: string | undefined
): MintAccountInfo | undefined {
  const accountInfo = useAccountInfo(address);
  return React.useMemo(() => {
    if (address === undefined) return;

    try {
      const data = accountInfo?.data?.details?.data;
      if (!data) return;
      if (data.program !== "spl-token" || data.parsed.type !== "mint") {
        return;
      }

      return create(data.parsed.info, MintAccountInfo);
    } catch (err) {
      reportError(err, { address });
    }
  }, [address, accountInfo]);
}

export function useTokenAccountInfo(
  address: string | undefined
): TokenAccountInfo | undefined {
  const accountInfo = useAccountInfo(address);
  if (address === undefined) return;

  try {
    const data = accountInfo?.data?.details?.data;
    if (!data) return;
    if (data.program !== "spl-token" || data.parsed.type !== "account") {
      return;
    }

    return create(data.parsed.info, TokenAccountInfo);
  } catch (err) {
    reportError(err, { address });
  }
}

export function useFetchAccountInfo() {
  const dispatch = React.useContext(DispatchContext);
  if (!dispatch) {
    throw new Error(
      `useFetchAccountInfo must be used within a AccountsProvider`
    );
  }

  const { cluster, url } = useCluster();
  return React.useCallback(
    (pubkey: PublicKey) => {
      fetchAccountInfo(dispatch, pubkey, cluster, url);
    },
    [dispatch, cluster, url]
  );
}

