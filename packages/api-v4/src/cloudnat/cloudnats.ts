import Request from 'src/request';

import { API_ROOT } from '../constants';

import type { ResourcePage as Page } from '../types';
import type {
  CloudNAT,
  CreateCloudNATPayload,
  UpdateCloudNATPayload,
} from './types';

export const getCloudNATs = () =>
  Request<Page<CloudNAT>>(() => ({
    url: `${API_ROOT}/networking/cloudnats`,
    method: 'GET',
  }));

export const getCloudNAT = (id: number) =>
  Request<CloudNAT>(() => ({
    url: `${API_ROOT}/networking/cloudnats/${id}`,
    method: 'GET',
  }));

export const createCloudNAT = (data: CreateCloudNATPayload) =>
  Request<CloudNAT>(() => ({
    url: `${API_ROOT}/networking/cloudnats`,
    method: 'POST',
    data,
  }));

export const updateCloudNAT = (id: number, data: UpdateCloudNATPayload) =>
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
