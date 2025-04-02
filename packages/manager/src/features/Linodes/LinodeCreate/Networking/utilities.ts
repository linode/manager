import type {
  APIError,
  CreateLinodeInterfacePayload,
  FirewallSettings,
  InterfacePayload,
  InterfacePurpose,
} from '@linode/api-v4';

/**
 * Extend the API's new interface type with a vpc_id so that state management is easier for us
 * The new endpoint only uses subnet_id and I guess it derives the VPC from that?
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

  if (purpose === 'vlan') {
    return {
      ipam_address: linodeInterface.vlan?.ipam_address,
      label: linodeInterface.vlan?.vlan_label,
      purpose,
    };
  }

  if (purpose === 'vpc') {
    // New interfaces use "auto" to auto-assign a 1:1 NAT address, but legacy uses "any".
    const nat =
      linodeInterface.vpc?.ipv4?.addresses?.[0].nat_1_1_address === 'auto'
        ? 'any'
        : linodeInterface.vpc?.ipv4?.addresses?.[0].nat_1_1_address;

    // New interfaces use "auto" to auto-assign a VPC IP, but legacy will auto-assign with `null`.
    const vpcIp =
      linodeInterface.vpc?.ipv4?.addresses?.[0].address === 'auto'
        ? null
        : linodeInterface.vpc?.ipv4?.addresses?.[0].address;

    return {
      ip_ranges: linodeInterface.vpc?.ipv4?.ranges?.map(({ range }) => range),
      ipv4: {
        nat_1_1: nat,
        vpc: vpcIp,
      },
      purpose,
      subnet_id: linodeInterface.vpc?.subnet_id,
      vpc_id: linodeInterface.vpc?.vpc_id,
    };
  }

  return { purpose: 'public' };
};

const legacyFieldToNewFieldMap = {
  '].ipv4.nat_1_1': '].vpc.ipv4.addresses.0.nat_1_1_address',
  '].ipv4.vpc': '].vpc.ipv4.addresses.0.address',
  '].label': '].vlan.vlan_lanel',
  '].subnet_id': '].vpc.subnet_id',
};

/**
 * Our form's state stores interfaces in the new "Linode Interfaces" shape.
 * If the user selects legacy interfaces, we tranform the new interface into legacy interfaces.
 *
 * If the user selects legacy interfaces and the API returns API errors in the shape of legacy interface,
 * we need to map the errors to the new Linode Interfaces shape so they surface correctly in the UI.
 */
export const transformLegacyInterfaceErrorsToLinodeInterfaceErrors = (
  errors: APIError[]
) => {
  for (const error of errors) {
    for (const key in legacyFieldToNewFieldMap) {
      if (error.field && error.field.includes(key)) {
        error.field = error.field.replace(
          key,
          legacyFieldToNewFieldMap[key as keyof typeof legacyFieldToNewFieldMap]
        );
      }
      if (error.field && error.field.includes('ip_ranges')) {
        // Handle the more complex case where:
        // `interfaces[0].ip_ranges[1]` should map to `linodeInterfaces.0.vpc.ipv4.ranges.1.range`
        error.field = error.field.replace(
          /ip_ranges\[(\d+)\]/,
          'vpc.ipv4.ranges.$1.range'
        );
      }
      if (error.field && error.field.startsWith('interfaces')) {
        error.field = error.field.replace('interfaces', 'linodeInterfaces');
      }
    }
  }
  return errors;
};

export const getDefaultInterfacePayload = (
  purpose: InterfacePurpose,
  firewallSettings: FirewallSettings | null | undefined
): LinodeCreateInterface => {
  return {
    default_route: null,
    firewall_id: getDefaultFirewallForInterfacePurpose(
      purpose,
      firewallSettings
    ),
    public: {},
    purpose: 'public',
    vlan: null,
    vpc: {
      ipv4: { addresses: [{ address: 'auto', nat_1_1_address: null }] },
      // @ts-expect-error the user must select this (I can't find a way to make these types partial)
      subnet_id: null,
      // @ts-expect-error the user must select this (I can't find a way to make these types partial)
      vpc_id: null,
    },
  };
};

export const getDefaultFirewallForInterfacePurpose = (
  purpose: InterfacePurpose,
  firewallSettings: FirewallSettings | null | undefined
) => {
  if (!firewallSettings) {
    return null;
  }

  if (purpose === 'public') {
    return firewallSettings.default_firewall_ids.public_interface;
  }

  if (purpose === 'vpc') {
    return firewallSettings.default_firewall_ids.vpc_interface;
  }

  return null;
};
