import { createCloudNATSchema } from '@linode/validation';

import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type {
  CloudNAT,
  CloudNATIPAddress,
  CreateCloudNATPayload,
  UpdateCloudNATPayload,
} from './types';

export const getCloudNATs = (params?: Params, filter?: Filter) =>
  Request<Page<CloudNAT>>(
    setURL(`${API_ROOT}/networking/cloudnats`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

export const getCloudNAT = (id: number) =>
  Request<CloudNAT>(
    setURL(`${API_ROOT}/networking/cloudnats/${id}`),
    setMethod('GET'),
  );

export const createCloudNAT = (data: CreateCloudNATPayload) =>
  Request<CloudNAT>(
    setURL(`${API_ROOT}/networking/cloudnats`),
    setMethod('POST'),
    setData(data, createCloudNATSchema),
  );

export const updateCloudNAT = (id: number, data: UpdateCloudNATPayload) =>
  Request<CloudNAT>(
    setURL(`${API_ROOT}/networking/cloudnats/${id}`),
    setMethod('PUT'),
    setData(data, createCloudNATSchema),
  );

export const deleteCloudNAT = (id: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/networking/cloudnats/${id}`),
    setMethod('DELETE'),
  );

export const assignCloudNATAddress = (
  cloudNATId: number,
  address: { address: string },
) => {
  return Request<CloudNATIPAddress>(
    setMethod('POST'),
    setURL(`${API_ROOT}/networking/cloudnats/${cloudNATId}/addresses`),
    setData(address),
  );
};

export const getCloudNATAddresses = (
  cloudNATId: number,
  params?: Params,
  filter?: Filter,
) => {
  return Request<Page<CloudNATIPAddress>>(
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
    setURL(`${API_ROOT}/networking/cloudnats/${cloudNATId}/addresses`),
  );
};

export const getCloudNATAddress = (cloudNATId: number, address: string) => {
  return Request<CloudNATIPAddress>(
    setMethod('GET'),
    setURL(
      `${API_ROOT}/networking/cloudnats/${cloudNATId}/addresses/${address}`,
    ),
  );
};

export const deleteCloudNATAddress = (cloudNATId: number, address: string) => {
  return Request<{}>(
    setMethod('DELETE'),
    setURL(
      `${API_ROOT}/networking/cloudnats/${cloudNATId}/addresses/${address}`,
    ),
  );
};
