import type {
  CreateLinodeInterfacePayload,
  InterfacePayload,
} from '@linode/api-v4';

/**
 * Determines if the given interfaces payload array is of legacy interface type
 * or of the new Linode Interface type
 * @param interfaces the interfaces to confirm
 * @returns if interfaces is type InterfacePayload
 *
 * @TODO Linode Interfaces - may need to update some logic to depend on Account Settings for Interfaces soon
 * For now, an undefined/empty interfaces array will return true to match existing behavior
 */
export const getIsLegacyInterfaceArray = (
  interfaces: CreateLinodeInterfacePayload[] | InterfacePayload[] | undefined,
): interfaces is InterfacePayload[] => {
  return (
    interfaces === undefined ||
    interfaces.length === 0 ||
    interfaces.some((iface) => 'purpose' in iface)
  );
};
