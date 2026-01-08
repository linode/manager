import { isEmpty } from '@linode/api-v4';
import { Notice } from '@linode/ui';
import * as React from 'react';
import type { JSX } from 'react';

import { DEFAULT_DEVICE_LIMIT } from 'src/constants';
import {
  LINODE_UNREACHABLE_HELPER_TEXT,
  NATTED_PUBLIC_IP_HELPER_TEXT,
  NOT_NATTED_HELPER_TEXT,
} from 'src/features/VPCs/constants';
import { useFlags } from 'src/hooks/useFlags';

import type { ExtendedInterface } from '../LinodeSettings/InterfaceSelect';
import type { EditableFields } from './LinodeConfigDialog';
import type { DiskDevice, Interface, VolumeDevice } from '@linode/api-v4';

/**
 * Gets the index of the primary Linode interface
 *
 * The function does more than just look for `primary: true`. It will also return the index
 * of the implicit primary interface. (The API does not enforce that a Linode config always
 * has an interface that is marked as primary)
 *
 * This is the general logic we follow in this function:
 * - If an interface is primary we know that's the primary
 * - If the API response returns an empty array "interfaces": [], under the hood, a public interface eth0 is implicit. This interface will be primary.
 * - If a config has interfaces, but none of them are marked primary: true, then the first interface in the list that’s not a VLAN will be the primary interface
 *
 * @returns the index of the primary interface or `null` if there is not a primary interface
 */
export const getPrimaryInterfaceIndex = (interfaces: Interface[]) => {
  const indexOfPrimaryInterface = interfaces.findIndex((i) => i.primary);

  // If an interface has `primary: true` we know thats the primary so just return it.
  if (indexOfPrimaryInterface !== -1) {
    return indexOfPrimaryInterface;
  }

  // If the API response returns an empty array "interfaces": [] the Linode will by default have a public interface,
  // and it will be eth0 on the Linode. This interface will be primary.
  // This case isn't really nessesary because this form is built so that the interfaces state will be
  // populated even if the API returns an empty interfaces array, but I'm including it for completeness.
  if (isEmpty(interfaces)) {
    return null;
  }

  // If a config has interfaces but none of them are marked as primary,
  // then the first interface in the list that’s not a VLAN will shown as the primary interface.
  const inherentIndexOfPrimaryInterface = interfaces.findIndex(
    (i) => i.purpose !== 'vlan'
  );

  if (inherentIndexOfPrimaryInterface !== -1) {
    // If we're able to find the inherent primary interface, just return it.
    return inherentIndexOfPrimaryInterface;
  }

  // If we haven't been able to find the primary interface by this point, the Linode doesn't have one.
  // As an example, this is the case when a Linode only has a VLAN interface.
  return null;
};

/**
 * Determines the maximum available Linodes allowed for a configuration profile
 *
 * returns MAX(8, MIN(ram / 1024, 64))
 *
 * @param ram the Linode's available ram
 * @returns the device limit allowed
 */
export const useGetDeviceLimit = (ram: number) => {
  const flags = useFlags();
  if (flags.blockStorageVolumeLimit) {
    return Math.max(DEFAULT_DEVICE_LIMIT, Math.min(ram / 1024, 64));
  }

  return DEFAULT_DEVICE_LIMIT;
};

export const isDiskDevice = (
  device: DiskDevice | VolumeDevice
): device is DiskDevice => {
  return 'disk_id' in device && device.disk_id !== null;
};

export const isVolumeDevice = (
  device: DiskDevice | VolumeDevice
): device is VolumeDevice => {
  return 'volume_id' in device && device.volume_id !== null;
};

/**
 * We want to pad the interface list in the UI with purpose.none
 * interfaces up to the maximum (currently 3); any purpose.none
 * interfaces will be removed from the payload before submission,
 * they are only used as placeholders presented to the user as empty selects.
 */
export const padList = <T,>(list: T[], filler: T, size: number = 3): T[] => {
  return [...list, ...Array(Math.max(0, size - list.length)).fill(filler)];
};

export const noticeForScenario = (scenarioText: string) => (
  <Notice
    data-testid={'notice-for-unrecommended-scenario'}
    text={scenarioText}
    variant="warning"
  />
);

/**
 * Returns a JSX warning notice if the current network interface configuration
 * is unrecommended and may lead to undesired or unsupported behavior.
 *
 * @param _interface the current config interface being passed in
 * @param primaryInterfaceIndex the index of the primary interface
 * @param thisIndex the index of the current config interface within the `interfaces` array of the `config` object
 * @param values the values held in Formik state, having a type of `EditableFields`
 * @returns JSX.Element | null
 */
export const unrecommendedConfigNoticeSelector = ({
  _interface,
  primaryInterfaceIndex,
  thisIndex,
  values,
}: {
  _interface: ExtendedInterface;
  primaryInterfaceIndex: null | number;
  thisIndex: number;
  values: EditableFields;
}): JSX.Element | null => {
  const vpcInterface = _interface.purpose === 'vpc';
  const nattedIPv4Address = Boolean(_interface.ipv4?.nat_1_1);

  const filteredInterfaces =
    values.interfaces?.filter((_interface) => _interface.purpose !== 'none') ??
    [];

  // Edge case: users w/ ability to have multiple VPC interfaces. Scenario 1 & 2 notices not helpful if that's done
  const primaryInterfaceIsVPC =
    primaryInterfaceIndex !== null &&
    values.interfaces &&
    values.interfaces[primaryInterfaceIndex].purpose === 'vpc';

  /*
   Scenario 1:
    - the interface passed in to this function is a VPC interface
    - the index of the primary interface !== the index of the interface passed in to this function
    - nattedIPv4Address (i.e., "Assign a public IPv4 address for this Linode" checked)

   Scenario 2:
    - all of Scenario 1, except: !nattedIPv4Address (i.e., "Assign a public IPv4 address for this Linode" unchecked)

   Scenario 3:
    - only eth0 populated, and it is a VPC interface

   If not one of the above scenarios, do not display a warning notice re: configuration
  */
  if (
    vpcInterface &&
    primaryInterfaceIndex !== thisIndex &&
    !primaryInterfaceIsVPC
  ) {
    return nattedIPv4Address
      ? noticeForScenario(NATTED_PUBLIC_IP_HELPER_TEXT)
      : noticeForScenario(LINODE_UNREACHABLE_HELPER_TEXT);
  }

  if (filteredInterfaces.length === 1 && vpcInterface && !nattedIPv4Address) {
    return noticeForScenario(NOT_NATTED_HELPER_TEXT);
  }

  return null;
};
