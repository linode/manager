import type {
  APIError,
  CreateLinodeInterfacePayload,
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
    return {
      ip_ranges: linodeInterface.vpc?.ipv4?.ranges?.map(({ range }) => range),
      ipv4: {
        nat_1_1: linodeInterface.vpc?.ipv4?.addresses?.[0].nat_1_1_address,
        vpc: linodeInterface.vpc?.ipv4?.addresses?.[0].address,
      },
      purpose,
      subnet_id: linodeInterface.vpc?.subnet_id,
      vpc_id: linodeInterface.vpc?.vpc_id,
    };
  }

  return { purpose: 'public' };
};

const legacyFieldToNewFieldMap = {
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
      if (error.field && error.field.startsWith('interfaces')) {
        error.field = error.field.replace('interfaces', 'linodeInterfaces');
      }
    }
  }
  return errors;
};
