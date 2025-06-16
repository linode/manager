import Request from 'src/request';

import { API_ROOT } from '../constants';

import type {
  CloudNAT,
  CreateCloudNATRequest,
  PaginatedCloudNATResponse,
  UpdateCloudNATRequest,
} from './types';

export const getCloudNATs = () =>
  Request<PaginatedCloudNATResponse>(() => ({
    url: `${API_ROOT}/networking/cloudnats`,
    method: 'GET',
  }));

export const getCloudNAT = (id: number) =>
  Request<CloudNAT>(() => ({
    url: `${API_ROOT}/networking/cloudnats/${id}`,
    method: 'GET',
  }));

export const createCloudNAT = (data: CreateCloudNATRequest) =>
  Request<CloudNAT>(() => ({
    url: `${API_ROOT}/networking/cloudnats`,
    method: 'POST',
    data,
  }));

export const updateCloudNAT = (id: number, data: UpdateCloudNATRequest) =>
  Request<CloudNAT>(() => ({
    url: `${API_ROOT}/networking/cloudnats/${id}`,
    method: 'PUT',
    data,
  }));

export const deleteCloudNAT = (id: number) =>
  Request<void>(() => ({
    url: `${API_ROOT}/networking/cloudnats/${id}`,
    method: 'DELETE',
  }));
