import { object, string } from 'yup';

export const importZoneSchema = object({
  domain: string().required(),
  remote_nameserver: string().required(),
});