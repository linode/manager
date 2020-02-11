import { array, number, object, string } from 'yup';

export const CreateFirewallSchema = object({
  label: string(),
  tags: array().of(string()),
  rules: object().required('You must provide a set of Firewall rules.')
});

export const FirewallDeviceSchema = object({
  type: string()
    .oneOf(['linode', 'nodebalancer'])
    .required('Device type is required.'),
  id: number().required('ID is required.')
});
