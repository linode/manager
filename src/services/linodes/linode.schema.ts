import { array, boolean, mixed, number, object, string } from 'yup';
// import * as zxcvbn from 'zxcvbn';

const stackscript_data = array().of(object());

/* @todo add more comprehensive validation.
*  First validate password using the regex used by the API. Then make sure the password also has a zxcvbn score >= 3. 
*  Only run validation tests if image is provided (as otherwise the value passed is an empty string, which will fail
*  validation.)
*/
const root_pass = string()
  // .required('Root password is required.')
  // .when('image', {
  //   is: (value) => Boolean(value),
  //   then: string().min(0),
  //   otherwise: string()
  //     .min(6, "Password must be between 6 and 128 characters.")
  //     .max(128, "Password must be between 6 and 128 characters.")
  //     .matches(/^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[!"#$%&'()*+,-.\/:;<=>?@\[\]^_`{|}~\\]))|((?=.*[A-Z])(?=.*[!"#$%&'()*+,-.\/:;<=>?@\[\]^_`{|}~\\]))|((?=.*[0-9])(?=.*[!"#$%&'()*+,-.\/:;<=>?@\[\]^_`{|}~\\])))/,
  //       "Password must contain at least 2 of the following classes: uppercase letters, lowercase letters, numbers, and punctuation.")
  //     .test('is-strong-password', 'Please choose a stronger password.', value => zxcvbn(value).score > 3)
  // });
  
export const ResizeLinodeDiskSchema = object({
  size: number().required().min(1),
});

export const CreateLinodeSchema = object({
  type: string()
    .ensure()
    .required('Plan is required.'),
  region: string()
    .ensure()
    .required('Region is required.'),
  stackscript_id: number().notRequired(),
  backup_id: number().notRequired(),
  swap_size: number().notRequired(),
  image: string().nullable(true),
  root_pass: root_pass.notRequired(),
  authorized_keys: array().of(string()).notRequired(),
  backups_enabled: boolean().notRequired(),
  stackscript_data,
  booted: boolean().notRequired(),
  label: string().notRequired()
    .min(3, "Label must contain between 3 and 32 characters.")
    .max(32,"Label must contain between 3 and 32 characters.")
    .matches(/^[a-zA-Z]((?!--|__)[a-zA-Z0-9-_])+$/,
      "Label can only use alphanumeric characters, dashes, or underscores."),
  tags: array().of(string()).notRequired(),
  private_ip: boolean().notRequired(),
  authorized_users: array().of(string()).notRequired()
});

const alerts = object({
  cpu: number(),
  network_in: number(),
  network_out: number(),
  transfer_quota: number(),
  io: number(),
});

const schedule = object({
  day: mixed().oneOf(["Scheduling", "W0", "W2", "W4", "W8", "W10",
  "W12", "W14", "W16", "W18", "W20", "W22"]),
  window: mixed().oneOf(["Scheduling", "Sunday", "Monday", "Tuesday",
  "Wednesday", "Thursday", "Friday", "Saturday"]),
});

const backups = object({
  schedule,
  enabled: boolean(),
})

export const UpdateLinodeSchema = object({
  label: string().notRequired()
    .ensure()
    .min(3, "Label must contain between 3 and 32 characters.")
    .max(32,"Label must contain between 3 and 32 characters.")
    .matches(/^[a-zA-Z]((?!--|__)[a-zA-Z0-9-_])+$/,
      "Label can only use alphanumeric characters, dashes, or underscores."),
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

export const RebuildLinodeSchema = object({
  image: string().required('An image is required.'),
  root_pass,
  authorized_keys: array().of(SSHKeySchema),
  authorized_users: array().of(string()),
  stackscript_id: number().notRequired(),
  stackscript_data,
  booted: boolean().notRequired()
});

export const IPAllocationSchema = object({
  type: string()
    .required('IP address type (IPv4) is required.')
    .oneOf(['ipv4'], "Only IPv4 addresses can be allocated."),
  public: boolean()
    .required("Must specify public or private IP address.")
});

export const CreateSnapshotSchema = object({
  label: string()
  .required("A snapshot label is required.")
  .min(1, "Label must be between 1 and 255 characters.")
  .max(255, "Label must be between 1 and 255 characters.")
}); 

const device = object({
  disk_id: number().nullable(true),
  volume_id: number().nullable(true)
}).nullable(true);

const devices = object({
  sda: device,
  sdb: device,
  sdc: device,
  sdd: device,
  sde: device,
  sdf: device,
  sdg: device,
  sdh: device
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
    .required("Label is required.")
    .min(1, "Label must be between 1 and 48 characters.")
    .max(48, "Label must be between 1 and 48 characters."),
  devices: devices.required("A list of devices is required."),
  kernel: string(),
  comments: string(),
  memory_limit: number(),
  run_level: mixed().oneOf(["default", "single", "binbash"]),
  virt_mode: mixed().oneOf(["paravirt", "fullvirt"]),
  helpers,
  root_device: string()
});

export const UpdateLinodeConfigSchema = object({
  label: string()
    .min(1, "Label must be between 1 and 48 characters.")
    .max(48, "Label must be between 1 and 48 characters."),
  devices,
  kernel: string(),
  comments: string(),
  memory_limit: number(),
  run_level: mixed().oneOf(["default", "single", "binbash"]),
  virt_mode: mixed().oneOf(["paravirt", "fullvirt"]),
  helpers,
  root_device: string()
});

export const CreateLinodeDiskSchema = object({
  size: number().required("Disk size is required."),
  label: string()
    .required("A disk label is required.")
    .min(1, "Label must be between 1 and 48 characters.")
    .max(48, "Label must be between 1 and 48 characters."),
  filesystem: mixed().oneOf(["raw", "swap", "ext3", "ext4", "initrd"]),
  read_only: boolean(),
  image: string(),
  authorized_keys: array().of(string()),
  authorized_users: array().of(string()),
  root_pass,
  stackscript_id: number(),
  stackscript_data, 
});