import { array, boolean, mixed, number, object, string } from 'yup';

export const resizeLinodeDiskSchema = object({
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
  image: string().notRequired(),
  root_pass: string().notRequired(),
  authorized_keys: array().of(string()).notRequired(),
  backups_enabled: boolean().notRequired(),
  stackscript_data: object().notRequired(),
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
  root_pass: string()
    .required('Root password is required.')
    .min(6, "Password must be between 6 and 128 characters.")
    .max(128, "Password must be between 6 and 128 characters."),
  authorized_keys: array().of(SSHKeySchema),
  authorized_users: array().of(string()),
  stackscript_id: number().notRequired(),
  stackscript_data: array().of(object()),
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