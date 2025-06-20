import type { IPTypes } from './types';

export const disableIPRow = (inputs: {
  hasLinodeInterfaces: boolean | undefined;
  hasPublicLinodeInterface: boolean | undefined;
  ipType: IPTypes;
  isLinodeInterface: boolean;
  isVPCOnlyLinode: boolean;
}) => {
  const {
    isLinodeInterface,
    hasLinodeInterfaces,
    hasPublicLinodeInterface,
    isVPCOnlyLinode,
    ipType,
  } = inputs;

  if (isLinodeInterface) {
    if (
      (isVPCOnlyLinode && !hasPublicLinodeInterface) ||
      !hasLinodeInterfaces
    ) {
      return ipType === 'Public – IPv4' || ipType === 'Public – IPv6 – SLAAC';
    }

    if (!hasPublicLinodeInterface) {
      return ipType === 'Public – IPv6 – SLAAC';
    }
  }

  // For config interfaces - IPv4 will always be disabled if Linode is VPC only Linode
  return isVPCOnlyLinode && ipType === 'Public – IPv4';
};
