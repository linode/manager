import { array, number, object, string } from 'yup';

const VALID_PORT_SIZES = [
  64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,
] as const;

export const createCloudNATSchema = object({
  addresses: array()
    .of(
      object({
        address: string().required('Address must be a string.'),
      }),
    )
    .notRequired(),

  label: string()
    .required('Label is required.')
    .max(150, 'Label must be 150 characters or fewer.'),

  port_prefix_default_len: number()
    .oneOf(VALID_PORT_SIZES as unknown as number[], 'Invalid port size.')
    .notRequired(),

  region: string().required('Region is required.'),
});

export const updateCloudNATSchema = object({
  label: string().max(150, 'Label must be 150 characters or fewer.'),
});
