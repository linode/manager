import { getIsLegacyInterface } from '../utilities';

import type {
  CreateLinodeInterfacePayload,
  InterfacePayload,
} from '@linode/api-v4';

export function getSelectedInterfaceType(
  networkInterface: CreateLinodeInterfacePayload | InterfacePayload | undefined
) {
  if (networkInterface === undefined) {
    return 'public';
  }

  if (getIsLegacyInterface(networkInterface)) {
    return networkInterface.purpose;
  }

  if (networkInterface.public) {
    return 'public';
  }

  if (networkInterface.vlan) {
    return 'vlan';
  }

  if (networkInterface.vpc) {
    return 'vpc';
  }

  return 'public';
}
