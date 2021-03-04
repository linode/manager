import { array, boolean, lazy, mixed, number, object, string } from 'yup';
// import zxcvbn from 'zxcvbn';
// import { MINIMUM_PASSWORD_STRENGTH } from 'src/constants';

const stackscript_data = array().of(object()).nullable(true);

/**
 * Interfaces are Record<string, InterfaceItem>
 *
 * {
 *  "eth0": { "id": 10 },
 *  "eth1": { "id": 12 }
 * }
 *
 * .default() and .lazy() below are required to
 * make this dynamic field naming work out
 */
export const linodeInterfaceItemSchema = object({
  id: number().required('Interface ID is required.'),
}).default(undefined);

export const linodeInterfaceSchema = lazy((obj?: Record<any, any>) =>
  typeof obj === 'undefined'
    ? object().notRequired()
    : object(Object.keys(obj).map((_) => linodeInterfaceItemSchema))
);

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

export const CreateLinodeSchema = object({
  type: string().ensure().required('Plan is required.'),
  region: string().ensure().required('Region is required.'),
  stackscript_id: number().notRequired(),
  backup_id: number().notRequired(),
  swap_size: number().notRequired(),
  image: string().notRequired(),
  authorized_keys: array().of(string()).notRequired(),
  backups_enabled: boolean().notRequired(),
  stackscript_data,
  booted: boolean().notRequired(),
  label: string()
    .transform((v) => (v === '' ? undefined : v))
    .notRequired()
    .min(3, 'Label must contain between 3 and 32 characters.')
    .max(32, 'Label must contain between 3 and 32 characters.'),
  tags: array().of(string()).notRequired(),
  private_ip: boolean().notRequired(),
  authorized_users: array().of(string()).notRequired(),
  root_pass: string().when('image', {
    is: (value) => Boolean(value),
    then: string().required(
      'You must provide a root password when deploying from an image.'
    ),
    // .concat(rootPasswordValidation),
    otherwise: string().notRequired(),
  }),
  interfaces: linodeInterfaceSchema,
});

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
    'Invalid day value.'
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
    'Invalid schedule value.'
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
    .min(3, 'Label must contain between 3 and 32 characters.')
    .max(32, 'Label must contain between 3 and 32 characters.'),
  tags: array().of(string()).notRequired(),
  watchdog_enabled: boolean().notRequired(),
  alerts,
  backups,
});

const SSHKeySchema = object({
  id: number(),
  label: string(),
  ssh_key: string(),
  created: string(),
});

// Include `shape()` here so that the schema can be extended without TS complaining.
export const RebuildLinodeSchema = object().shape({
  image: string().required('An image is required.'),
  root_pass: string().required('Password is required.'),
  authorized_keys: array().of(SSHKeySchema),
  authorized_users: array().of(string()),
  stackscript_id: number().notRequired(),
  stackscript_data,
  booted: boolean().notRequired(),
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
  disk_id: number().nullable(true),
  volume_id: number().nullable(true),
}).nullable(true);

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
  interfaces: linodeInterfaceSchema,
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
  interfaces: linodeInterfaceSchema,
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
    is: (value) => Boolean(value),
    then: string().required(
      'You must provide a root password when deploying from an image.'
    ),
    // .concat(rootPasswordValidation),
    otherwise: string().notRequired(),
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

export const CreateLinodeDiskFromImageSchema = CreateLinodeDiskSchema.clone().shape(
  {
    image: string().required('An image is required.'),
  }
);
