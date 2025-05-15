import { array, boolean, number, object, string } from 'yup';

export const updateIPSchema = object().shape({
  rdns: string().notRequired().nullable(),
});

export const allocateIPSchema = object().shape({
  type: string()
    .required()
    .matches(
      /^ipv4$/,
      'Only IPv4 address may be allocated through this endpoint.',
    ),
  public: boolean().required(),
  linode_id: number().required(),
});

export const assignAddressesSchema = object().shape({
  region: string().required(),
  assignments: array().of(object()).required(),
});

export const shareAddressesSchema = object().shape({
  linode_id: number().required(),
  ips: array().of(string()),
});
