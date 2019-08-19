import { boolean, number, object, string } from 'yup';

export const updateManagedLinodeSchema = object({
  ssh: object({
    access: boolean(),
    user: string().max(32),
    ip: string(),
    port: number()
      .min(1)
      .max(65535)
  })
});
