import { array, object, string } from 'yup';

export const CreateFirewallSchema = object({
  label: string(),
  tags: array().of(string()),
  rules: object().required('You must provide a set of Firewall rules.')
});
