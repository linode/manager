import type { IPTypes, UpdatedIPTypes } from './types';

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

// @TODO Linode Interfaces: when the Linode Interfaces feature flag is no longer needed,
// we can instead directly update IPTypes and relevant logic
export const getIPType: Record<IPTypes, GetIpDisplayFunction> = {
  'IPv4 – Private': (displayIPKeyFirst) =>
    displayIPKeyFirst ? 'Private – IPv4' : 'IPv4 – Private',
  'IPv4 – Public': (displayIPKeyFirst) =>
    displayIPKeyFirst ? 'Public – IPv4' : 'IPv4 – Public',
  'IPv4 – Reserved (private)': (displayIPKeyFirst) =>
    displayIPKeyFirst ? 'Reserved IPv4 (private)' : 'IPv4 – Reserved (private)',
  'IPv4 – Reserved (public)': (displayIPKeyFirst) =>
    displayIPKeyFirst ? 'Reserved IPv4 (public)' : 'IPv4 – Reserved (public)',
  'IPv4 – Shared': (displayIPKeyFirst) =>
    displayIPKeyFirst ? 'Shared – IPv4' : 'IPv4 – Shared',
  'IPv4 – VPC': (displayIPKeyFirst) =>
    displayIPKeyFirst ? 'VPC – IPv4' : 'IPv4 – VPC',
  'IPv4 – VPC – Range': (displayIPKeyFirst) =>
    displayIPKeyFirst ? 'VPC – Range – IPv4' : 'IPv4 – VPC – Range',
  'IPv6 – Link Local': (displayIPKeyFirst) =>
    displayIPKeyFirst ? 'Link Local – IPv6' : 'IPv6 – Link Local',
  'IPv6 – Range': (displayIPKeyFirst) =>
    displayIPKeyFirst ? 'Range – IPv6' : 'IPv6 – Range',
  'IPv6 – SLAAC': (displayIPKeyFirst) =>
    displayIPKeyFirst ? 'Public – SLAAC – IPv6' : 'IPv6 – SLAAC',
  'VPC IPv4 – NAT': (displayIPKeyFirst) =>
    displayIPKeyFirst ? 'VPC NAT – IPv4' : 'VPC IPv4 – NAT',
};
