import {
  CreateDomainPayload,
  Domain,
  UpdateDomainPayload
} from '@linode/api-v4/lib/domains';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import actionCreatorFactory from 'typescript-fsa';

import { GetAllData } from 'src/utilities/getAll';

export interface DomainId {
  domainId: number;
}

export type UpdateDomainParams = DomainId & UpdateDomainPayload;

const actionCreator = actionCreatorFactory(`@@manager/domains`);

export const upsertDomain = actionCreator<Domain>('upsert');

export const upsertMultipleDomains = actionCreator<Domain[]>(
  'upsert-multiple-domains'
);

export const deleteDomain = actionCreator<number>('delete');

export const createDomainActions = actionCreator.async<
  CreateDomainPayload,
  Domain,
  APIError[]
>('create');
export const updateDomainActions = actionCreator.async<
  UpdateDomainParams,
  Domain,
  APIError[]
>('update');
export const deleteDomainActions = actionCreator.async<
  DomainId,
  {},
  APIError[]
>('delete');

export const getDomainsActions = actionCreator.async<
  void,
  GetAllData<Domain>,
  APIError[]
>('get-all');

export interface PageParams {
  params?: any;
  filters?: any;
}
export const getDomainsPageActions = actionCreator.async<
  PageParams,
  ResourcePage<Domain>,
  APIError[]
>('get-page');
