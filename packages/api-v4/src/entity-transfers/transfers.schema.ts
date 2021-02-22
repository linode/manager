import { array, number, object } from 'yup';

export const CreateTransferSchema = object({
  entities: object({
    linodes: array().of(number())
  })
});
