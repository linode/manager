import { number, object, string } from 'yup';

export const CreateVolumeSchema = object({
  region: string(),
    // .when('linode_id', {
    //   is: (id) => id === undefined || id === '',
    //   then: string().required("Must provide a region or a Linode ID."),
    // }),
  linode_id: number(),
  size: number()
    .typeError("Size must be a number.")
    .integer()
    .min(10, "Size must be between 10 and 10240.")
    .max(10240, "Size must be between 10 and 10240."),
  label: string()
    .required("Label is required.")
    .ensure()
    .trim()
    .min(1, "Label must be between 1 and 32 characters.")
    .max(32, "Label must be 32 characters or less."),
  config_id: number().typeError("Config ID must be a number.")
});
