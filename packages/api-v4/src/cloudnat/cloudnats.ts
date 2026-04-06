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
