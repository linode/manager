import { array, boolean, number, object, string } from 'yup';

export const updateIPSchema = object().shape({
  rdns: string().notRequired().nullable(),
  reserved: boolean().notRequired(),
});

export const allocateIPSchema = object().shape({
  type: string()
    .required()
    .matches(
      /^ipv4$/,
      'Only IPv4 address may be allocated through this endpoint.',
    ),
  public: boolean().required(),
  linode_id: number().when('reserved', {
    is: false,
    then: (schema) => schema.required(),
    otherwise: (schema) =>
      schema.when('region', {
        is: (region: string | undefined) => region === undefined,
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.notRequired(),
      }),
  }),
  reserved: boolean().notRequired(),
  region: string().when('reserved', {
    is: false,
    then: (schema) => schema.notRequired(),
    otherwise: (schema) =>
      schema.when('linode_id', {
        is: (linode_id: number | undefined) => linode_id === undefined,
        then: (schema) => schema.required(),
        otherwise: (schema) => schema.notRequired(),
      }),
  }),
});

export const assignAddressesSchema = object().shape({
  region: string().required(),
  assignments: array().of(object()).required(),
});

export const shareAddressesSchema = object().shape({
  linode_id: number().required(),
  ips: array().of(string()),
});

export const reserveIPSchema = object().shape({
  region: string().required(),
  tags: array().of(string().defined()).notRequired(),
});
