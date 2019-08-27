import { array, number, object, string } from 'yup';
import { MAX_VOLUME_SIZE } from '../constants';

const createSizeValidation = (minSize: number = 10) =>
  number()
    .integer()
    .typeError(`Size must be a number`)
    .min(minSize, `Size must be between ${minSize} and ${MAX_VOLUME_SIZE}.`)
    .max(
      MAX_VOLUME_SIZE,
      `Size must be between ${minSize} and ${MAX_VOLUME_SIZE}.`,
    )
    .required(`A size is required.`);

// @todo this should be used in CreateVolumeForm and CreateVolumeFromLinodeForm
// export const tag = string()
//   .min(3, "Tags must be between 3 and 50 characters.")
//   .max(50, "Tags must be between 3 and 50 characters.")

export const CreateVolumeSchema = object({
  region: string().when('linode_id', {
    is: id => id === undefined || id === '',
    then: string().required('Must provide a region or a Linode ID.'),
  }),
  linode_id: number(),
  size: createSizeValidation(10),
  label: string()
    .required('Label is required.')
    .ensure()
    .trim()
    .min(1, 'Label must be between 1 and 32 characters.')
    .max(32, 'Label must be 32 characters or less.'),
  config_id: number().typeError('Config ID must be a number.'),
  tags: array().of(string()),
});

export const CloneVolumeSchema = object({
  label: string().required(),
});

export const ResizeVolumeSchema = (minSize: number = 10) =>
  object({
    size: createSizeValidation(minSize),
  });

export const UpdateVolumeSchema = object({
  label: string().required(),
});

export const AttachVolumeSchema = object({
  linode_id: number().required(),
  config_id: number().required(),
});
