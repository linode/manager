import ipaddr from 'ipaddr.js';
import { array, lazy, object, string } from 'yup';

const LABEL_MESSAGE = 'Label must be between 1 and 64 characters.';
const LABEL_REQUIRED = 'Label is required.';
const LABEL_REQUIREMENTS =
  'Label must include only ASCII letters, numbers, and dashes.';

const labelTestDetails = {
  testName: 'no two dashes in a row',
  testMessage: 'Label must not contain two dashes in a row.',
};

export const IP_EITHER_BOTH_NOT_NEITHER =
  'A subnet must have either IPv4 or IPv6, or both, but not neither.';
// @TODO VPC IPv6 - remove below constant when IPv6 is in GA
const TEMPORARY_IPV4_REQUIRED_MESSAGE = 'A subnet must have an IPv4 range.';

export const determineIPType = (ip: string) => {
  try {
    let addr;
    const [, mask] = ip.split('/');
    if (mask) {
      const parsed = ipaddr.parseCIDR(ip);
      addr = parsed[0];
    } else {
      addr = ipaddr.parse(ip);
    }
    return addr.kind();
  } catch (e) {
    return undefined;
  }
};

/**
 * VPC-related IP validation that handles for single IPv4 and IPv6 addresses as well as
 * IPv4 ranges in CIDR format and IPv6 ranges with prefix lengths.
 * @param { value } - the IP address string to be validated
 * @param { shouldHaveIPMask } - a boolean indicating whether the value should have a mask (e.g., /32) or not
 * @param { mustBeIPMask } - a boolean indicating whether the value MUST be an IP mask/prefix length or not
 * @param { isIPv6Subnet } - a boolean indicating whether the IPv6 value is for a subnet
 * @param { checkIPv6PrefixLengthIs64 } – a boolean indicating whether the IPv6 value prefix length is 64 (for nested `range` fields in config/Linode interface objects)
 */

export const vpcsValidateIP = ({
  value,
  shouldHaveIPMask,
  mustBeIPMask,
  checkIPv6PrefixLengthIs64,
}: {
  checkIPv6PrefixLengthIs64?: boolean;
  isIPv6Subnet?: boolean;
  mustBeIPMask: boolean;
  shouldHaveIPMask: boolean;
  value: null | string | undefined;
}): boolean => {
  if (!value) {
    return false;
  }

  const [, mask] = value.trim().split('/');

  /*
    // 1. If the test specifies the value must be a mask, and the value is not, fail the test.
    // 2. If the value is a mask, ensure it is a valid IPv6 mask. For MVP: the IPv6 property of
    // the Subnet /POST object is just the prefix length (CIDR mask), 64-125.
    // subnetMaskFromPrefixLength returns null for invalid prefix lengths
  */
  if (mustBeIPMask) {
    // Check that the value equals just the /mask. This is to prevent, for example,
    // something like 2600:3c00::f03c:92ff:feeb:98f9/64 from falsely passing this check.
    const valueIsMaskOnly = value === `/${mask}`;

    return !mask
      ? false
      : ipaddr.IPv6.subnetMaskFromPrefixLength(Number(mask)) !== null &&
          valueIsMaskOnly &&
          Number(mask) >= 64 &&
          Number(mask) <= 125;
  }

  try {
    const type = determineIPType(value);
    const isIPv4 = type === 'ipv4';
    const isIPv6 = type === 'ipv6';

    if (!isIPv4 && !isIPv6) {
      return false;
    }

    // Do protocol-specific checks
    if (isIPv4) {
      if (shouldHaveIPMask) {
        ipaddr.IPv4.parseCIDR(value);
      } else {
        ipaddr.IPv4.isValid(value);
        ipaddr.IPv4.parse(value); // Parse again to prompt test failure if it has a mask but should not.
      }
    }

    if (isIPv6) {
      // @TODO NB-VPC: update the IPv6 prefix if required for NB-VPC integration
      // Range values specified for legacy config interfaces (ipv6.slaac[].range, ipv6.ranges[].range) and Linode interfaces
      // (vpc.ipv6.slaac[].range, vpc.ipv6.ranges[].range) must be a /64 IPv6 network CIDR
      if (checkIPv6PrefixLengthIs64) {
        return mask === '64';
      }

      if (shouldHaveIPMask) {
        ipaddr.IPv6.parseCIDR(value);
      } else {
        ipaddr.IPv6.isValid(value);
        ipaddr.IPv6.parse(value); // Parse again to prompt test failure if it has a mask but should not.
      }
    }

    return true;
  } catch (err) {
    return false;
  }
};

const labelValidation = string()
  .test(
    labelTestDetails.testName,
    labelTestDetails.testMessage,
    (value) => !value?.includes('--'),
  )
  .min(1, LABEL_MESSAGE)
  .max(64, LABEL_MESSAGE)
  .matches(/^[a-zA-Z0-9-]*$/, LABEL_REQUIREMENTS);

export const updateVPCSchema = object({
  label: labelValidation,
  description: string(),
});

const VPCIPv6Schema = object({
  range: string()
    .optional()
    .test(
      'IPv6 prefix length',
      'Must be the prefix length 52, 48, or 44 of the IP, e.g. /52',
      (value) => {
        if (value && value.length > 0) {
          return ['/44', '/48', '/52'].includes(value);
        }
      },
    ),
});

const VPCIPv6SubnetSchema = object({
  range: string()
    .required()
    .test(
      'IPv6 prefix length',
      'Must be the prefix length (52-62) of the IP, e.g. /52',
      (value) => {
        if (value && value !== 'auto' && value.length > 0) {
          const [, mask] = value.split('/');
          // VPC subnets must be assigned an IPv6 prefix of 52-62
          return +mask >= 52 && +mask <= 62;
        }
      },
    ),
});

// @TODO VPC IPv6: Delete this when IPv6 is in GA
export const createSubnetSchemaIPv4 = object({
  label: labelValidation.required(LABEL_REQUIRED),
  ipv4: string().when('ipv6', {
    is: (value: unknown) =>
      value === '' || value === null || value === undefined,
    then: (schema) =>
      schema.required(TEMPORARY_IPV4_REQUIRED_MESSAGE).test({
        name: 'IPv4 CIDR format',
        message: 'The IPv4 range must be in CIDR format.',
        test: (value) =>
          vpcsValidateIP({
            value,
            shouldHaveIPMask: true,
            mustBeIPMask: false,
          }),
      }),
    otherwise: (schema) =>
      lazy((value: string | undefined) => {
        switch (typeof value) {
          case 'string':
            return schema.notRequired().test({
              name: 'IPv4 CIDR format',
              message: 'The IPv4 range must be in CIDR format.',
              test: (value) =>
                vpcsValidateIP({
                  value,
                  shouldHaveIPMask: true,
                  mustBeIPMask: false,
                }),
            });

          case 'undefined':
            return schema.notRequired().nullable();

          default:
            return schema.notRequired().nullable();
        }
      }),
  }),
});

export const createSubnetSchemaWithIPv6 = object().shape(
  {
    label: labelValidation.required(LABEL_REQUIRED),
    ipv4: string().when('ipv6', {
      is: (value: unknown) =>
        value === '' || value === null || value === undefined,
      then: (schema) =>
        schema.required(IP_EITHER_BOTH_NOT_NEITHER).test({
          name: 'IPv4 CIDR format',
          message: 'The IPv4 range must be in CIDR format.',
          test: (value) =>
            vpcsValidateIP({
              value,
              shouldHaveIPMask: true,
              mustBeIPMask: false,
            }),
        }),
      otherwise: (schema) =>
        lazy((value: string | undefined) => {
          switch (typeof value) {
            case 'string':
              return schema.notRequired().test({
                name: 'IPv4 CIDR format',
                message: 'The IPv4 range must be in CIDR format.',
                test: (value) =>
                  vpcsValidateIP({
                    value,
                    shouldHaveIPMask: true,
                    mustBeIPMask: false,
                  }),
              });

            case 'undefined':
              return schema.notRequired().nullable();

            default:
              return schema.notRequired().nullable();
          }
        }),
    }),
    ipv6: array()
      .of(VPCIPv6SubnetSchema)
      .when('ipv4', {
        is: (value: unknown) =>
          value === '' || value === null || value === undefined,
        then: (schema) => schema.required(IP_EITHER_BOTH_NOT_NEITHER),
      }),
  },
  [
    ['ipv6', 'ipv4'],
    ['ipv4', 'ipv6'],
  ],
);

const createVPCIPv6Schema = VPCIPv6Schema.concat(
  object({
    allocation_class: string().optional(),
  }),
);

export const createVPCSchema = object({
  label: labelValidation.required(LABEL_REQUIRED),
  description: string(),
  region: string().required('Region is required'),
  subnets: array().of(createSubnetSchemaIPv4),
  ipv6: array().of(createVPCIPv6Schema).max(1).optional(),
});

export const modifySubnetSchema = object({
  label: labelValidation.required(LABEL_REQUIRED),
});
