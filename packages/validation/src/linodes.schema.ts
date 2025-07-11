// We must use a default export for ipaddr.js so our packages node compatibility
// Refer to https://github.com/linode/manager/issues/8675
import ipaddr from 'ipaddr.js';
import { array, boolean, lazy, mixed, number, object, string } from 'yup';

import { vpcsValidateIP } from './vpcs.schema';

const VPC_INTERFACE_IP_RULE =
  'A VPC interface must have an IPv4, an IPv6, or both, but not neither.';

// Functions for test validations
const validateIP = (ipAddress?: null | string) => {
  if (!ipAddress) {
    return true;
  }

  // We accept IP ranges (i.e., CIDR notation).
  try {
    ipaddr.parseCIDR(ipAddress);
  } catch (err) {
    return false;
  }

  return true;
};

const test_vpcsValidateIP = (value?: null | string) => {
  // Since the field is optional, return true here to prevent an incorrect test failure.
  if (value === undefined || value === null) {
    return true;
  }

  return vpcsValidateIP({
    value,
    shouldHaveIPMask: false,
    mustBeIPMask: false,
  });
};

const validateIPv6PrefixLengthIs64 = (value?: null | string) => {
  if (value === undefined || value === null) {
    return false;
  }

  if (value === 'auto') {
    // Do not fail the test for "auto" values as those are valid
    return true;
  }

  return vpcsValidateIP({
    value,
    shouldHaveIPMask: true,
    mustBeIPMask: false,
    checkIPv6PrefixLengthIs64: true,
  });
};

// Utils
const testnameDisallowedBasedOnPurpose = (allowedPurpose: string) =>
  `Disallowed for non-${allowedPurpose} interfaces`;
const testmessageDisallowedBasedOnPurpose = (
  allowedPurpose: string,
  field: string,
) =>
  `${field} is not allowed for interfaces that do not have a purpose set to ${allowedPurpose}.`;

// Constants
const LINODE_LABEL_CHAR_REQUIREMENT =
  'Label must contain between 3 and 64 characters.';

// Schemas
const stackscript_data = object().nullable();

const IPv4 = string()
  .notRequired()
  .nullable()
  .test({
    name: 'validateIPv4',
    message: 'Must be a valid IPv4 address, e.g. 192.168.2.0',
    test: (value) => test_vpcsValidateIP(value),
  });

const IPv6 = string()
  .notRequired()
  .nullable()
  .test({
    name: 'validateIPv6',
    message:
      'Must be a valid IPv6 address, e.g. 2600:3c00::f03c:92ff:feeb:98f9.',
    test: (value) => test_vpcsValidateIP(value),
  });

const ipv4ConfigInterface = object().when('purpose', {
  is: 'vpc',
  then: (schema) =>
    schema
      .shape({
        vpc: IPv4,
        nat_1_1: lazy((value) =>
          value === 'any' ? string().notRequired().nullable() : IPv4,
        ),
      })
      .when('ipv6', {
        is: (value: unknown) => value === null || value === undefined,
        then: (schema) => schema.required(VPC_INTERFACE_IP_RULE),
      }),
  otherwise: (schema) =>
    schema
      .nullable()
      .test({
        name: testnameDisallowedBasedOnPurpose('VPC'),
        message: testmessageDisallowedBasedOnPurpose('vpc', 'ipv4.vpc'),
        /*
        Workaround to get test to fail if field is populated when it should not be based
        on purpose (inspired by similar approach in firewalls.schema.ts for ports field).
        Similarly-structured logic (return typeof xyz === 'undefined') throughout this
        file serves the same purpose.
      */
        test: (value: any) => {
          if (value?.vpc) {
            return typeof value.vpc === 'undefined';
          }

          return true;
        },
      })
      .test({
        name: testnameDisallowedBasedOnPurpose('VPC'),
        message: testmessageDisallowedBasedOnPurpose('vpc', 'ipv4.nat_1_1'),
        test: (value: any) => {
          if (value?.nat_1_1) {
            return typeof value.nat_1_1 === 'undefined';
          }

          return true;
        },
      }),
});

const slaacSchema = object().shape({
  range: string()
    .required()
    .test({
      name: 'IPv6 prefix length',
      message: 'Must be a /64 IPv6 network CIDR',
      test: (value) => validateIPv6PrefixLengthIs64(value),
    }),
});

const IPv6ConfigInterfaceRangesSchema = object({
  range: string()
    .optional()
    .test({
      name: 'IPv6 prefix length',
      message: 'Must be a /64 IPv6 network CIDR',
      test: (value) => validateIPv6PrefixLengthIs64(value),
    }),
});

const ipv6ConfigInterface = object().when('purpose', {
  is: 'vpc',
  then: (schema) =>
    schema
      .shape({
        slaac: array()
          .of(slaacSchema)
          .test({
            name: 'slaac field must have zero or one entry',
            message: 'ipv6.slaac field must have zero or one entry',
            test: (value) =>
              !value ? true : value?.length === 0 || value?.length === 1,
          }),
        ranges: array().of(IPv6ConfigInterfaceRangesSchema),
        is_public: boolean(),
      })
      .notRequired()
      .when('ipv4', {
        is: (value: unknown) => value === null || value === undefined,
        then: (schema) => schema.required(VPC_INTERFACE_IP_RULE),
      }),
  otherwise: (schema) =>
    schema
      .nullable()
      .test({
        name: testnameDisallowedBasedOnPurpose('VPC'),
        message: testmessageDisallowedBasedOnPurpose('vpc', 'ipv6.slaac'),
        test: (value: any) => {
          if (value?.slaac) {
            return typeof value.slaac === 'undefined';
          }

          return true;
        },
      })
      .test({
        name: testnameDisallowedBasedOnPurpose('VPC'),
        message: testmessageDisallowedBasedOnPurpose('vpc', 'ipv6.ranges'),
        test: (value: any) => {
          if (value?.ranges) {
            return typeof value.ranges === 'undefined';
          }

          return true;
        },
      })
      .test({
        name: testnameDisallowedBasedOnPurpose('VPC'),
        message: testmessageDisallowedBasedOnPurpose('vpc', 'ipv6.is_public'),
        test: (value: any) => {
          if (value?.is_public) {
            return typeof value.is_public === 'undefined';
          }

          return true;
        },
      }),
});

// This is the validation schema for legacy interfaces attached to configuration profiles
// For new interfaces, denoted as Linode Interfaces, see CreateLinodeInterfaceSchema or ModifyLinodeInterfaceSchema
export const ConfigProfileInterfaceSchema = object().shape(
  {
    purpose: string()
      .oneOf(
        ['public', 'vlan', 'vpc'] as const,
        'Purpose must be public, vlan, or vpc.',
      )
      .defined()
      .required(),
    label: string().when('purpose', {
      is: 'vlan',
      then: (schema) =>
        schema
          .required('VLAN label is required.')
          .min(1, 'VLAN label must be between 1 and 64 characters.')
          .max(64, 'VLAN label must be between 1 and 64 characters.')
          .matches(
            /[a-zA-Z0-9-]+/,
            'Must include only ASCII letters, numbers, and dashes',
          ),
      otherwise: (schema) =>
        schema.when('label', {
          is: null,
          then: (s) => s.nullable(),
          otherwise: (s) =>
            s.test({
              name: testnameDisallowedBasedOnPurpose('VLAN'),
              message: testmessageDisallowedBasedOnPurpose('vlan', 'label'),
              test: (value) => typeof value === 'undefined' || value === '',
            }),
        }),
    }),
    ipam_address: string().when('purpose', {
      is: 'vlan',
      then: (schema) =>
        schema.notRequired().nullable().test({
          name: 'validateIPAM',
          message: 'Must be a valid IPv4 range, e.g. 192.0.2.0/24.',
          test: validateIP,
        }),
      otherwise: (schema) =>
        schema.when('ipam_address', {
          is: null,
          then: (s) => s.nullable(),
          otherwise: (s) =>
            s.test({
              name: testnameDisallowedBasedOnPurpose('VLAN'),
              message: testmessageDisallowedBasedOnPurpose(
                'vlan',
                'ipam_address',
              ),
              test: (value) => typeof value === 'undefined' || value === '',
            }),
        }),
    }),
    primary: boolean()
      .test(
        'cant-use-with-vlan',
        "VLAN interfaces can't be the primary interface",
        (value, context) => {
          const isVLANandIsSetToPrimary =
            value && context.parent.purpose === 'vlan';
          return !isVLANandIsSetToPrimary;
        },
      )
      .optional(),
    subnet_id: number().when('purpose', {
      is: 'vpc',
      then: (schema) =>
        schema
          .transform((value) => (isNaN(value) ? undefined : value))
          .required('Subnet is required.'),
      otherwise: (schema) =>
        schema
          .notRequired()
          .nullable()
          .test({
            name: testnameDisallowedBasedOnPurpose('VPC'),
            message: testmessageDisallowedBasedOnPurpose('vpc', 'subnet_id'),
            test: (value) => typeof value === 'undefined' || value === null,
          }),
    }),
    vpc_id: number().when('purpose', {
      is: 'vpc',
      then: (schema) => schema.required('VPC is required.'),
      otherwise: (schema) =>
        schema
          .notRequired()
          .nullable()
          .test({
            name: testnameDisallowedBasedOnPurpose('VPC'),
            message: testmessageDisallowedBasedOnPurpose('vpc', 'vpc_id'),
            test: (value) => typeof value === 'undefined' || value === null,
          }),
    }),
    ipv4: ipv4ConfigInterface,
    ipv6: ipv6ConfigInterface,
    ip_ranges: array()
      .of(string().defined())
      .notRequired()
      .nullable()
      .when('purpose', {
        is: 'vpc',
        then: (schema) =>
          schema
            .of(
              string().test(
                'valid-ip-range',
                'Must be a valid IPv4 range, e.g. 192.0.2.0/24.',
                validateIP,
              ),
            )
            .notRequired()
            .nullable(),
        otherwise: (schema) =>
          schema
            .test({
              name: testnameDisallowedBasedOnPurpose('VPC'),
              message: testmessageDisallowedBasedOnPurpose('vpc', 'ip_ranges'),
              test: (value) => typeof value === 'undefined' || value === null,
            })
            .notRequired()
            .nullable(),
      }),
  },
  [
    ['ipv6', 'ipv4'],
    ['ipv4', 'ipv6'],
  ],
);

export const ConfigProfileInterfacesSchema = array()
  .of(ConfigProfileInterfaceSchema)
  .test(
    'unique-public-interface',
    'Only one public interface per config is allowed.',
    (list?: any[] | null) => {
      if (!list) {
        return true;
      }

      return (
        list.filter((thisSlot) => thisSlot.purpose === 'public').length <= 1
      );
    },
  );

export const UpdateConfigInterfaceOrderSchema = object({
  ids: array().of(number()).required('The list of interface IDs is required.'),
});

export const UpdateConfigInterfaceSchema = object({
  primary: boolean().notRequired(),
  ipv4: object()
    .notRequired()
    .shape({
      vpc: IPv4,
      nat_1_1: lazy((value) =>
        value === 'any' ? string().notRequired().nullable() : IPv4,
      ),
    }),
  ipv6: object().notRequired().nullable().shape({
    vpc: IPv6,
  }),
  ip_ranges: array().of(string().test(validateIP)).max(1).notRequired(),
});

// const rootPasswordValidation = string().test(
//   'is-strong-password',
//   'Password does not meet strength requirements.',
//   (value: string) =>
//     Boolean(value) && zxcvbn(value).score >= MINIMUM_PASSWORD_STRENGTH
// );

export const ResizeLinodeDiskSchema = object({
  size: number().required('Size is required.').min(1),
});

export const UpdateLinodePasswordSchema = object({
  password: string().required('Password is required.'),
  // .concat(rootPasswordValidation)
});

const MetadataSchema = object({
  user_data: string().nullable().defined(),
});

const PlacementGroupPayloadSchema = object({
  id: number().required(),
});

const DiskEncryptionSchema = string()
  .oneOf(['enabled', 'disabled'])
  .notRequired();

const alerts = object({
  cpu: number()
    .typeError('CPU Usage must be a number')
    .min(0, 'Must be between 0 and 4800')
    .max(4800, 'Must be between 0 and 4800'),
  network_in: number(),
  network_out: number(),
  transfer_quota: number(),
  io: number(),
}).notRequired();

const schedule = object({
  day: mixed().oneOf(
    [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    'Invalid day value.',
  ),
  window: mixed().oneOf(
    [
      'W0',
      'W2',
      'W4',
      'W6',
      'W8',
      'W10',
      'W12',
      'W14',
      'W16',
      'W18',
      'W20',
      'W22',
      'W24',
    ],
    'Invalid schedule value.',
  ),
});

const backups = object({
  schedule,
  enabled: boolean(),
});

export const UpdateLinodeSchema = object({
  label: string()
    .transform((v) => (v === '' ? undefined : v))
    .notRequired()
    .min(3, LINODE_LABEL_CHAR_REQUIREMENT)
    .max(64, LINODE_LABEL_CHAR_REQUIREMENT),
  tags: array().of(string()).notRequired(),
  watchdog_enabled: boolean().notRequired(),
  alerts,
  backups,
});

export const RebuildLinodeSchema = object({
  image: string().required('An image is required.'),
  root_pass: string().required('Password is required.'),
  authorized_keys: array().of(string().required()),
  authorized_users: array().of(string().required()),
  stackscript_id: number().optional(),
  stackscript_data: stackscript_data.notRequired(),
  booted: boolean().optional(),
  /**
   * `metadata` is an optional object with required properties (see https://github.com/jquense/yup/issues/772)
   */
  metadata: MetadataSchema.optional().default(undefined),
  disk_encryption: string().oneOf(['enabled', 'disabled']).optional(),
});

export const RebuildLinodeFromStackScriptSchema = RebuildLinodeSchema.shape({
  stackscript_id: number().required('A StackScript is required.'),
});

export const IPAllocationSchema = object({
  type: string()
    .required('IP address type (IPv4) is required.')
    .oneOf(['ipv4'], 'Only IPv4 addresses can be allocated.'),
  public: boolean().required('Must specify public or private IP address.'),
});

export const CreateSnapshotSchema = object({
  label: string()
    .required('A snapshot label is required.')
    .min(1, 'Label must be between 1 and 255 characters.')
    .max(255, 'Label must be between 1 and 255 characters.'),
});

const device = object({
  disk_id: number().nullable(),
  volume_id: number().nullable(),
}).nullable();

const devices = object({
  sda: device,
  sdb: device,
  sdc: device,
  sdd: device,
  sde: device,
  sdf: device,
  sdg: device,
  sdh: device,
});

const helpers = object({
  updatedb_disabled: boolean(),
  distro: boolean(),
  modules_dep: boolean(),
  network: boolean(),
  devtmpfs_automount: boolean(),
});

export const CreateLinodeConfigSchema = object({
  label: string()
    .required('Label is required.')
    .min(1, 'Label must be between 1 and 48 characters.')
    .max(48, 'Label must be between 1 and 48 characters.'),
  devices: devices.required('A list of devices is required.'),
  kernel: string(),
  comments: string(),
  memory_limit: number(),
  run_level: mixed().oneOf(['default', 'single', 'binbash']),
  virt_mode: mixed().oneOf(['paravirt', 'fullvirt']),
  helpers,
  root_device: string(),
  interfaces: ConfigProfileInterfacesSchema,
});

export const UpdateLinodeConfigSchema = object({
  label: string()
    .min(1, 'Label must be between 1 and 48 characters.')
    .max(48, 'Label must be between 1 and 48 characters.'),
  devices,
  kernel: string(),
  comments: string(),
  memory_limit: number(),
  run_level: mixed().oneOf(['default', 'single', 'binbash']),
  virt_mode: mixed().oneOf(['paravirt', 'fullvirt']),
  helpers,
  root_device: string(),
  interfaces: ConfigProfileInterfacesSchema,
});

export const CreateLinodeDiskSchema = object({
  size: number().required('Disk size is required.'),
  label: string()
    .required('A disk label is required.')
    .min(1, 'Label must be between 1 and 48 characters.')
    .max(48, 'Label must be between 1 and 48 characters.'),
  filesystem: mixed().oneOf(['raw', 'swap', 'ext3', 'ext4', 'initrd']),
  read_only: boolean(),
  image: string(),
  authorized_keys: array().of(string()),
  authorized_users: array().of(string()),
  root_pass: string().when('image', {
    is: (value: any) => Boolean(value),
    then: (schema) =>
      schema.required(
        'You must provide a root password when deploying from an image.',
      ),
    // .concat(rootPasswordValidation),
    otherwise: (schema) => schema.notRequired(),
  }),
  stackscript_id: number(),
  stackscript_data,
});

export const UpdateLinodeDiskSchema = object({
  label: string()
    .notRequired()
    .min(1, 'Label must be between 1 and 48 characters.')
    .max(48, 'Label must be between 1 and 48 characters.'),
  filesystem: mixed()
    .notRequired()
    .oneOf(['raw', 'swap', 'ext3', 'ext4', 'initrd']),
});

export const CreateLinodeDiskFromImageSchema =
  CreateLinodeDiskSchema.clone().shape({
    image: string()
      .required('An image is required.')
      .typeError('An image is required.'),
  });

const LABEL_LENGTH_MESSAGE = 'Label must be between 1 and 64 characters.';
const LABEL_CHARACTER_TYPES =
  'Must include only ASCII letters, numbers, and dashes';

export const UpgradeToLinodeInterfaceSchema = object({
  config_id: number().nullable(),
  dry_run: boolean(),
});

export const UpdateLinodeInterfaceSettingsSchema = object({
  network_helper: boolean().nullable(),
  default_route: object({
    ipv4_interface_id: number().nullable(),
    ipv6_interface_id: number().nullable(),
  }),
});

const BaseInterfaceIPv4AddressSchema = object({
  address: string().required('IPv4 address is required.'),
  primary: boolean(),
});

const VPCInterfaceIPv4RangeSchema = object({
  range: string().required('Range is required.'),
});

const VPCInterfaceIPv6RangeSchema = object({
  range: string().test((value) => validateIPv6PrefixLengthIs64(value)),
});

const PublicInterfaceRangeSchema = object({
  range: string().required('IPv6 range is required.').nullable(),
});

const CreateVPCInterfaceIpv4AddressSchema = object({
  address: string().required('VPC IPv4 is required.'),
  primary: boolean(),
  nat_1_1_address: string().nullable(),
});

const CreateVlanInterfaceSchema = object({
  vlan_label: string()
    .min(1, LABEL_LENGTH_MESSAGE)
    .max(64, LABEL_LENGTH_MESSAGE)
    .matches(/[a-zA-Z0-9-]+/, LABEL_CHARACTER_TYPES)
    .required('VLAN label is required.'),
  ipam_address: string().nullable(),
});

const AclpAlertsPayloadSchema = object({
  system: array().of(number().defined()).required(),
  user: array().of(number().defined()).required(),
});

export const CreateVPCInterfaceSchema = object({
  subnet_id: number().required('Subnet is required.'),
  ipv4: object({
    addresses: array().of(CreateVPCInterfaceIpv4AddressSchema),
    ranges: array().of(VPCInterfaceIPv4RangeSchema),
  }).notRequired(),
  ipv6: object({
    slaac: array().of(slaacSchema),
    ranges: array().of(VPCInterfaceIPv6RangeSchema),
    is_public: boolean(),
  }).notRequired(),
});

export const CreateLinodeInterfaceSchema = object({
  firewall_id: number().nullable(),
  default_route: object({
    ipv4: boolean(),
    ipv6: boolean(),
  })
    .notRequired()
    .default(null),
  vpc: CreateVPCInterfaceSchema.notRequired().default(null),
  public: object({
    ipv4: object({
      addresses: array().of(BaseInterfaceIPv4AddressSchema),
    }).notRequired(),
    ipv6: object({
      ranges: array().of(PublicInterfaceRangeSchema),
    }).notRequired(),
  })
    .notRequired()
    .default(null),
  vlan: CreateVlanInterfaceSchema.notRequired().default(null),
});

const ModifyVPCInterfaceIpv4AddressSchema = object({
  address: string(),
  primary: boolean().nullable(),
  nat_1_1_address: string().nullable(),
});

const ModifyVlanInterfaceSchema = object({
  vlan_label: string()
    .required()
    .nullable()
    .min(1, LABEL_LENGTH_MESSAGE)
    .max(64, LABEL_LENGTH_MESSAGE)
    .matches(/[a-zA-Z0-9-]+/, LABEL_CHARACTER_TYPES),
  ipam_address: string().nullable(),
})
  .notRequired()
  .nullable();

const ModifyVPCInterfaceIPv6RangeSchema = object({
  range: string().notRequired().nullable(),
});

export const ModifyLinodeInterfaceSchema = object({
  default_route: object({
    ipv4: boolean().nullable(),
    ipv6: boolean().nullable(),
  })
    .notRequired()
    .nullable(),
  vpc: object({
    subnet_id: number().required(),
    ipv4: object({
      addresses: array()
        .of(ModifyVPCInterfaceIpv4AddressSchema)
        .notRequired()
        .nullable(),
      ranges: array().of(VPCInterfaceIPv4RangeSchema).nullable(),
    })
      .notRequired()
      .nullable(),
    ipv6: object({
      slaac: array()
        .of(ModifyVPCInterfaceIPv6RangeSchema)
        .notRequired()
        .nullable(),
      ranges: array()
        .of(ModifyVPCInterfaceIPv6RangeSchema)
        .notRequired()
        .nullable(),
      is_public: boolean().notRequired().nullable(),
    })
      .notRequired()
      .nullable(),
  })
    .notRequired()
    .nullable(),
  public: object({
    ipv4: object({
      addresses: array().of(BaseInterfaceIPv4AddressSchema).nullable(),
    })
      .notRequired()
      .nullable(),
    ipv6: object({
      ranges: array().of(PublicInterfaceRangeSchema).nullable(),
    })
      .notRequired()
      .nullable(),
  })
    .notRequired()
    .nullable(),
  vlan: ModifyVlanInterfaceSchema,
});

export const CreateLinodeSchema = object({
  type: string().ensure().required('Plan is required.'),
  region: string().ensure().required('Region is required.'),
  stackscript_id: number().nullable().notRequired(),
  backup_id: number().nullable().notRequired(),
  swap_size: number().notRequired(),
  image: string().when('stackscript_id', {
    is: (value?: number) => value !== undefined,
    then: (schema) => schema.ensure().required('Image is required.'),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  authorized_keys: array().of(string().defined()).notRequired(),
  backups_enabled: boolean().notRequired(),
  stackscript_data,
  booted: boolean().notRequired(),
  label: string()
    .transform((v) => (v === '' ? undefined : v))
    .notRequired()
    .min(3, LINODE_LABEL_CHAR_REQUIREMENT)
    .max(64, LINODE_LABEL_CHAR_REQUIREMENT),
  tags: array().of(string().defined()).notRequired(),
  private_ip: boolean().notRequired(),
  authorized_users: array().of(string().defined()).notRequired(),
  root_pass: string().when('image', {
    is: (value: any) => Boolean(value),
    then: (schema) =>
      schema.required(
        'You must provide a root password when deploying from an image.',
      ),
    otherwise: (schema) => schema.notRequired(),
  }),
  interfaces: array().when(
    'interface_generation',
    ([interface_generation], schema) => {
      if (interface_generation === 'linode') {
        return schema.of(CreateLinodeInterfaceSchema);
      }

      return ConfigProfileInterfacesSchema;
    },
  ),
  interface_generation: string()
    .oneOf(['legacy_config', 'linode'])
    .notRequired(),
  network_helper: boolean(),
  ipv4: array()
    .of(string().defined())
    .when('interface_generation', {
      is: 'linode',
      then: (schema) =>
        schema
          .nullable()
          .notRequired()
          .test({
            name: 'IPv4 field is not allowed for Linode Interfaces',
            message:
              'ipv4 field must be omitted or empty if using Linode Interfaces',
            test: (value) => !value || value.length === 0,
          }),
    }),
  metadata: MetadataSchema.notRequired().default(undefined),
  firewall_id: number().nullable().notRequired(),
  placement_group: PlacementGroupPayloadSchema.notRequired().default(undefined),
  disk_encryption: DiskEncryptionSchema,
  maintenance_policy: string()
    .oneOf(['linode/migrate', 'linode/power_off_on', undefined])
    .notRequired()
    .nullable(),
  alerts: AclpAlertsPayloadSchema.notRequired().default(undefined),
});
