import React from "react";
import { Account, useFetchAccountInfo } from "providers/accounts";
import { create } from "superstruct";
import { TableCardBody } from "components/common/TableCardBody";
import { Address } from "components/common/Address";
import { UnknownAccountCard } from "./UnknownAccountCard";
import { Cluster, useCluster } from "providers/cluster";
import { reportError } from "utils/sentry";
import {
  SolPublicKey,
  VerificationMethod,
  ServiceEndpoint,
} from "@identity.com/sol-did-client";
import { PublicKey } from "@solana/web3.js";
import {
  DidSolTokenAccount,
  DidSolTokenAccountInfo,
} from "validators/accounts/didsol";

export function DidSolAccountSection({
  account,
  soldata,
}: {
  account: Account;
  soldata: DidSolTokenAccount;
}) {
  const { cluster } = useCluster();
  try {
    const info = create(soldata.info, DidSolTokenAccountInfo);
    return <SolDidAccountCard account={account} info={info} />;
  } catch (err) {
    if (cluster !== Cluster.Custom) {
      reportError(err, {
        address: account.pubkey.toBase58(),
      });
    }
  }
  return <UnknownAccountCard account={account} />;
}

function display(value: any): JSX.Element {
  if (Array.isArray(value)) {
    console.log(value);
    return (
      <ul style={{ listStyle: "none" }}>
        {value.map((val) => (
          <li className="text-end">{display(val)}</li>
        ))}
      </ul>
    );
  } else if (value instanceof PublicKey) {
    return <Address pubkey={value} alignRight link />;
  } else if (typeof value === "string") {
    return <>{value}</>;
  } else if (typeof value === "number") {
    return <>{value}</>;
  } else {
    return <>Not available</>;
  }
}

function SolDidAccountCard({
  account,
  info,
}: {
  account: Account;
  info: DidSolTokenAccountInfo;
}) {
  const fetchInfo = useFetchAccountInfo();
  const refresh = () => fetchInfo(account.pubkey);
  const attributes = Object.entries(info)
    .filter(([key, val]) => !Array.isArray(val) || !(val.length === 0))
    .map(([key, val]) => {
      let label = key.charAt(0).toUpperCase() + key.slice(1) + "";
      return (
        <tr key={key}>
          <td>{label}</td>
          <td className="text-end">{display(val)}</td>
        </tr>
      );
    });
  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3 className="card-header-title mb-0 d-flex align-items-center">
            Solana-Did Account Overview
          </h3>
          <button className="btn btn-white btn-sm" onClick={refresh}>
            <span className="fe fe-refresh-cw mr-2"></span>
            Refresh
          </button>
        </div>
        <TableCardBody>{attributes}</TableCardBody>
      </div>
    </>
  );
}
