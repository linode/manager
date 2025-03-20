import type { IPTypes, UpdatedIPTypes } from './types';

// @TODO Linode Interfaces: when the Linode Interfaces feature flag is no longer needed,
// we can instead directly update IPTypes and relevant logic
export const ipTypeMap: Record<IPTypes, UpdatedIPTypes> = {
  'IPv4 – Private': 'Private – IPv4',
  'IPv4 – Public': 'Public – IPv4',
  'IPv4 – Reserved (private)': 'Reserved IPv4 (private)',
  'IPv4 – Reserved (public)': 'Reserved IPv4 (public)',
  'IPv4 – Shared': 'Shared – IPv4',
  'IPv4 – VPC': 'VPC – IPv4',
  'IPv4 – VPC – Range': 'VPC – Range – IPv4',
  'IPv6 – Link Local': 'Link Local – IPv6',
  'IPv6 – Range': 'Range – IPv6',
  'IPv6 – SLAAC': 'Public – SLAAC – IPv6',
  'VPC IPv4 – NAT': 'VPC NAT – IPv4',
};

type GetIpDisplayFunction = (
  displayIPKeyFirst: boolean
) => IPTypes | UpdatedIPTypes;

export const getIPType: Record<string, GetIpDisplayFunction> = {
  ipv4Private: (displayIPKeyFirst) =>
    displayIPKeyFirst ? ipTypeMap['IPv4 – Private'] : 'IPv4 – Private',
  ipv4Public: (displayIPKeyFirst) =>
    displayIPKeyFirst ? ipTypeMap['IPv4 – Public'] : 'IPv4 – Public',
  ipv4ReservedPrivate: (displayIPKeyFirst) =>
    displayIPKeyFirst
      ? ipTypeMap['IPv4 – Reserved (private)']
      : 'IPv4 – Reserved (private)',
  ipv4ReservedPublic: (displayIPKeyFirst) =>
    displayIPKeyFirst
      ? ipTypeMap['IPv4 – Reserved (public)']
      : 'IPv4 – Reserved (public)',
  ipv4Shared: (displayIPKeyFirst) =>
    displayIPKeyFirst ? ipTypeMap['IPv4 – Shared'] : 'IPv4 – Shared',
  ipv4VPC: (displayIPKeyFirst) =>
    displayIPKeyFirst ? ipTypeMap['IPv4 – VPC'] : 'IPv4 – VPC',
  ipv4VPCRange: (displayIPKeyFirst) =>
    displayIPKeyFirst ? ipTypeMap['IPv4 – VPC – Range'] : 'IPv4 – VPC – Range',
  ipv6LinkLocal: (displayIPKeyFirst) =>
    displayIPKeyFirst ? ipTypeMap['IPv6 – Link Local'] : 'IPv6 – Link Local',
  ipv6Range: (displayIPKeyFirst) =>
    displayIPKeyFirst ? ipTypeMap['IPv6 – Range'] : 'IPv6 – Range',
  ipv6Slaac: (displayIPKeyFirst) =>
    displayIPKeyFirst ? ipTypeMap['IPv6 – SLAAC'] : 'IPv6 – SLAAC',
  vpcIPv4Nat: (displayIPKeyFirst) =>
    displayIPKeyFirst ? ipTypeMap['VPC IPv4 – NAT'] : 'VPC IPv4 – NAT',
};
