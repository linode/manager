export type IPTypes =
  | 'IPv4 – Private'
  | 'IPv4 – Public'
  | 'IPv4 – Reserved (private)'
  | 'IPv4 – Reserved (public)'
  | 'IPv4 – Shared'
  | 'IPv4 – VPC – Range'
  | 'IPv4 – VPC'
  | 'IPv6 – Link Local'
  | 'IPv6 – Range'
  | 'IPv6 – SLAAC'
  | 'VPC IPv4 – NAT';

// @TODO Linode Interfaces: when feature flag is cleaned up, we can replace IPTypes' values with these values
export type UpdatedIPTypes =
  | 'Link Local – IPv6'
  | 'Private – IPv4'
  | 'Private – IPv4'
  | 'Public – IPv4'
  | 'Public – SLAAC – IPv6'
  | 'Range – IPv6'
  | 'Reserved IPv4 (private)'
  | 'Reserved IPv4 (public)'
  | 'Shared – IPv4'
  | 'VPC NAT – IPv4'
  | 'VPC – IPv4'
  | 'VPC – Range – IPv4';
