import type { IPTypes } from './types';

// Note: when the Linode Interfaces feature flag is no longer needed,
// we can instead directly update IPTypes and relevant logic
export const ipTypeToText: Record<IPTypes, string> = {
  'IPv4 – Private': 'Private – IPv4',
  'IPv4 – Public': 'Public – IPv4',
  'IPv4 – Reserved (private)': 'Reserved IPv4 (private)',
  'IPv4 – Reserved (public)': 'Reserved IPv4 (public)',
  'IPv4 – Shared': 'Shared – IPv4',
  'IPv4 – VPC': 'VPC – IPv4',
  'IPv4 – VPC – Range': 'VPC – Range – IPv4',
  'IPv6 – Link Local': 'Link Local – IPv6',
  'IPv6 – Range': 'Range – IPv6',
  'IPv6 – SLAAC': 'Public - SLAAC – IPv6',
  'VPC IPv4 – NAT': 'VPC NAT – IPv4',
};
