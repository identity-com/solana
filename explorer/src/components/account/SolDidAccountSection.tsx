import React from "react";
import { Account, lightService, lightVertification, useFetchAccountInfo } from "providers/accounts";
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

function displaycontroller(controller: PublicKey) {
  return <Address pubkey={controller} alignRight link />;
}

function displaycontrollers(controllers: PublicKey[]) {
  return <ul style={{ listStyle: "none" }}>
  {controllers.map((val) => (
    <li className="text-end">{displaycontroller(val)}</li>
  ))}
</ul>
}

function displayVertification(vertifications: lightVertification) {
  return (
    <ul style={{ listStyle: "none" }}>
      <li>{vertifications.id}</li>
      <li>
        <Address pubkey={vertifications.PublicKey} alignRight link />
      </li>
      <li>{vertifications.vertificationType}</li>
    </ul>
  );
}

function displayVertifications(vertifications: lightVertification[]) {
  return (
    <ul style={{ listStyle: "none" }}>
      {vertifications.map((val) => (
    <li className="text-end">{displayVertification(val)}</li>
  ))}
</ul>
  )
}

function displayString(oneStr: string) {
  return <>{oneStr}</>;
}

function displayStringArrays(strings: string[]) {
  return (
    <ul style={{ listStyle: "none" }}>
      {strings.map((val) => (
    <li className="text-end">{displayString(val)}</li>
  ))}
</ul>
  )
}

function displayServicePoint(service: lightService) {
  return (
    <ul style={{ listStyle: "none" }}>
      <li>{service.id}</li>
      <li>{service.endpointType}</li>
      <li>{service.Endpoint}</li>
      <li>{service.description}</li>
    </ul>
  );
}

function displayServicePoints(services: lightService[]) {
  return (
    <ul style={{ listStyle: "none" }}>
      {services.map((val) => (
        <li className="text-end">{displayServicePoint(val)}</li>
      ))}
    </ul>
  );
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
        <TableCardBody>
          {info.account && (
            <tr>
              <td>Account</td>
              <td className="text-end">
                <Address pubkey={info.account} alignRight link />
              </td>
            </tr>
          )}
          {info.authority && (
            <tr>
              <td>Authority</td>
              <td className="text-end">
                <Address pubkey={info.authority} alignRight link />
              </td>
            </tr>
          )}
          {info.version && (
            <tr>
              <td>Version</td>
              <td className="text-end">{info.version}</td>
            </tr>
          )}
          {info.accountVersion && (
            <tr>
              <td>Account Version</td>
              <td className="text-end">{info.accountVersion}</td>
            </tr>
          )}
          {info.controller && (
            <tr>
              <td>Controllers</td>
              <td className="text-end">{displaycontrollers(info.controller)}</td>
            </tr>
          )}
          {info.vertificationMethod && (
            <tr>
              <td>Vertification Method</td>
              <td className="text-end">{displayVertifications(info.vertificationMethod)}</td>
            </tr>
          )}
          {info.authentication && (
            <tr>
              <td>Authentiacation</td>
              <td className="text-end">{displayStringArrays(info.authentication)}</td>
            </tr>
          )}
          {info.capabilityInvocation && (
            <tr>
              <td>Capability Invocation</td>
              <td className="text-end">{displayStringArrays(info.capabilityInvocation)}</td>
            </tr>
          )}
          {info.capabilityDelegation && (
            <tr>
              <td>Capability Delegation</td>
              <td className="text-end">{displayStringArrays(info.capabilityDelegation)}</td>
            </tr>
          )}
          {info.keyAgreement && (
            <tr>
              <td>Key Agreement</td>
              <td className="text-end">{displayStringArrays(info.keyAgreement)}</td>
            </tr>
          )}
          {info.assertionMethod && (
            <tr>
              <td>Assertion Method</td>
              <td className="text-end">{displayStringArrays(info.assertionMethod)}</td>
            </tr>
          )}
          {info.ServiceEndpoint && (
            <tr>
              <td>Service Endpoint</td>
              <td className="text-end">{displayServicePoints(info.ServiceEndpoint)}</td>
            </tr>
          )}
          </TableCardBody>
      </div>
    </>
  );
}
