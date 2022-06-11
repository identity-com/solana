import React from "react";
import { Account, useFetchAccountInfo } from "providers/accounts";
import { create } from "superstruct";
import { TableCardBody } from "components/common/TableCardBody";
import { Address } from "components/common/Address";
import { UnknownAccountCard } from "./UnknownAccountCard";
import { Cluster, useCluster } from "providers/cluster";
import { reportError } from "utils/sentry";
import { SolDataConstructor, SolData, SolPublicKey, VerificationMethod, ServiceEndpoint } from "@identity.com/sol-did-client";
import {InfoTooltip} from "../common/InfoTooltip";
import { PublicKey } from "@solana/web3.js";

export function DidSolAccountSection({
                                             account,
                                             soldata,
                                           }: {
  account: Account;
  soldata: SolData;
}) {
  const { cluster } = useCluster();
  try {
    return <SolDidAccountCard account={account} info={soldata} />;
  } catch (err) {
    if (cluster !== Cluster.Custom) {
      reportError(err, {
        address: account.pubkey.toBase58(),
      });
    }
  }
  return <UnknownAccountCard account={account} />;
}

const timestampToDate = (timestamp: number) => new Date(timestamp * 1000);

function display(value: any): JSX.Element {
    if (Array.isArray(value)) {
      return <ul>
            {value.map(val => <li className="text-lg-right">{display(val)}</li>)}
        </ul>
    } else if (value instanceof PublicKey) {
        return <Address pubkey={value} alignRight link />
    } else if (value instanceof SolPublicKey) {
      return <Address pubkey={value.toPublicKey()} alignRight link />
    } else if (typeof value === "string") {
      return <td className="text-lg-right">{value}</td>
    } else if (typeof value === "number") {
      return <td className="text-lg-right">{value}</td>
    } else if (value instanceof VerificationMethod) {
      return <Address pubkey={value.pubkey.toPublicKey()} alignRight link />
    } else if (value instanceof ServiceEndpoint) {
      return <td className="text-lg-right">{value}</td>
    } else {
      return <td className="text-lg-right">Not available</td>
    }
  }

function SolDidAccountCard({
                                   account,
                                   info,
                                 }: {
  account: Account;
  info: SolData;
}) {
  const fetchInfo = useFetchAccountInfo();
  const refresh = () => fetchInfo(account.pubkey);
  const accountVersion = info.accountVersion;
  const version = info.accountVersion;
  const authority = info.authority;
  const controller = info.controller;
  const verificationMethod = info.verificationMethod;
  const authentication = info.authentication;
  const capabilityInvocation = info.capabilityInvocation;
  const capabilityDelegation = info.capabilityDelegation;
  const keyAgreement = info.keyAgreement;
  const assertionMethod = info.assertionMethod;
  const service = info.service;

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3 className="card-header-title mb-0 d-flex align-items-center">
            Overview
          </h3>
          <button className="btn btn-white btn-sm" onClick={refresh}>
            <span className="fe fe-refresh-cw mr-2"></span>
            Refresh
          </button>
        </div>
        <TableCardBody>
          <tr>
            <td>Address</td>
            <td className="text-lg-right">
              <Address pubkey={account.pubkey} alignRight raw />
            </td>
          </tr>
          {accountVersion && (
            <tr>
              <td>Owner</td>
              <td className="text-lg-right">
                {display(accountVersion)}
              </td>
            </tr>
          )}
          {version && (
            <tr>
              <td>Issuing Gatekeeper</td>
              <td className="text-lg-right">
                {display(version)}
              </td>
            </tr>
          )}
          {authority && (
            <tr>
              <td>Gatekeeper Network</td>
              <td className="text-lg-right">
                {display(authority)}
              </td>
            </tr>
          )}
        {controller && (
            <tr>
              <td>Gatekeeper Network</td>
              <td className="text-lg-right">
                {display(controller)}
              </td>
            </tr>
          )}
          {verificationMethod && (
            <tr>
              <td>Gatekeeper Network</td>
              <td className="text-lg-right">
                {display(verificationMethod)}
              </td>
            </tr>
          )}
        {authentication && (
            <tr>
              <td>Gatekeeper Network</td>
              <td className="text-lg-right">
                {display(authentication)}
              </td>
            </tr>
          )}
        {capabilityInvocation && (
            <tr>
              <td>Gatekeeper Network</td>
              <td className="text-lg-right">
                {display(capabilityInvocation)}
              </td>
            </tr>
          )}
        {capabilityDelegation && (
            <tr>
              <td>Gatekeeper Network</td>
              <td className="text-lg-right">
                {display(capabilityDelegation)}
              </td>
            </tr>
          )}
        {keyAgreement && (
            <tr>
              <td>Gatekeeper Network</td>
              <td className="text-lg-right">
                {display(keyAgreement)}
              </td>
            </tr>
          )}
        {assertionMethod && (
            <tr>
              <td>Gatekeeper Network</td>
              <td className="text-lg-right">
                {display(assertionMethod)}
              </td>
            </tr>
          )}          
          {service && (
            <tr>
              <td>Gatekeeper Network</td>
              <td className="text-lg-right">
                {display(service)}
              </td>
            </tr>
          )}
        </TableCardBody>
      </div>
    </>
  );
}