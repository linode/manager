import type {
  CreateLinodeInterfacePayload,
  InterfacePayload,
  InterfacePurpose,
} from '@linode/api-v4';

/**
 * Extend the API's new interface type with a vpc_id so that state managment is easier for us
 * The new endpoint only uses subnet_id and I guess it dervies the VPC from that?
 */
interface VPC extends NonNullable<CreateLinodeInterfacePayload['vpc']> {
  vpc_id: number;
}

/**
 * We extend the new `CreateLinodeInterfacePayload` to add extra state we need to track
 */
export interface LinodeCreateInterface extends CreateLinodeInterfacePayload {
  purpose: InterfacePurpose;
  vpc: VPC | null;
}

/**
 * Because the new Linode Create Networking UI only allows one interface to be configured,
 * we will use a single `CreateLinodeInterfacePayload` to hold all of our state. Then, we will use
 * this function to mutate the `CreateLinodeInterfacePayload` so that only the desired values
 * are kept for the selected interface type (Public, VPC, VLAN).
 */
export const getLinodeInterfacePayload = (
  networkInterface: LinodeCreateInterface
) => {
  const cleanedInterface = {
    ...networkInterface,
  };

  for (const key of ['public', 'vlan', 'vpc'] as const) {
    if (key !== networkInterface.purpose) {
      cleanedInterface[key] = null;
    }
  }

  return cleanedInterface;
};

/**
 * The UX for new Interface requires us to enable the user to toggle between Legacy and New Interfaces.
 * To make this possible, we will make our form's state be in the shape of `LinodeCreateInterface` and
 * we will convert these new interfaces to legacy interface onSubmit.
 */
export const getLegacyInterfaceFromLinodeInterface = (
  linodeInterface: LinodeCreateInterface
): InterfacePayload => {
  const purpose = linodeInterface.purpose;

  return {
    ip_ranges:
      purpose === 'vpc'
        ? linodeInterface.vpc?.ipv4?.ranges?.map(({ range }) => range)
        : null,
    ipam_address:
      purpose === 'vlan' ? linodeInterface.vlan?.ipam_address : null,
    ipv4:
      purpose === 'vpc'
        ? {
            nat_1_1: linodeInterface.vpc?.ipv4?.addresses?.[0].nat_1_1_address,
            vpc: linodeInterface.vpc?.ipv4?.addresses?.[0].address,
          }
        : undefined,
    label: purpose === 'vlan' ? linodeInterface.vlan?.vlan_label : null,
    purpose,
    subnet_id: purpose === 'vpc' ? linodeInterface.vpc?.subnet_id : null,
    vpc_id: purpose === 'vpc' ? linodeInterface.vpc?.vpc_id : null,
  };
};
