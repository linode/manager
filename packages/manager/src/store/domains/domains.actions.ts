import {
  CreateDomainPayload,
  Domain,
  getDomain,
  getDomains,
  UpdateDomainPayload
} from 'linode-js-sdk/lib/domains';
import { Dispatch } from 'redux';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import actionCreatorFactory from 'typescript-fsa';
import { ThunkActionCreator } from '../types';

export interface DomainId {
  domainId: number;
}

export type UpdateDomainParams = DomainId & UpdateDomainPayload;

/**
 * Actions
 */
const actionCreator = actionCreatorFactory(`@@manager/domains`);

export const getDomainsRequest = actionCreator('request');

export const getDomainsSuccess = actionCreator<{
  data: Domain[];
  results: number;
}>('success');

export const getDomainsFailure = actionCreator<Linode.ApiFieldError[]>('fail');

export const upsertDomain = actionCreator<Domain>('upsert');

export const deleteDomain = actionCreator<number>('delete');

export const createDomainActions = actionCreator.async<
  CreateDomainPayload,
  Domain,
  Linode.ApiFieldError[]
>('create');
export const updateDomainActions = actionCreator.async<
  UpdateDomainParams,
  Domain,
  Linode.ApiFieldError[]
>('update');
export const deleteDomainActions = actionCreator.async<
  DomainId,
  {},
  Linode.ApiFieldError[]
>('delete');

/**
 * Async
 */
export const requestDomains: ThunkActionCreator<Promise<Domain[]>> = () => (
  dispatch: Dispatch<any>
) => {
  dispatch(getDomainsRequest());

  return getAll<Domain>(getDomains)()
    .then(domains => {
      dispatch(getDomainsSuccess(domains));
      return domains;
    })
    .catch(err => {
      const errors = getAPIErrorOrDefault(
        err,
        'There was an error retrieving your Domains.'
      );
      dispatch(getDomainsFailure(errors));
      return err;
    });
};

type RequestDomainForStoreThunk = ThunkActionCreator<void, number>;
export const requestDomainForStore: RequestDomainForStoreThunk = id => (
  dispatch,
  getState
) => {
  const { data } = getState().__resources.domains;

  const ids = data ? data.map(domain => domain.id) : [];

  getDomain(id)
    .then(response => response)
    .then(domain => {
      if (ids.includes(id)) {
        return dispatch(upsertDomain(domain));
      }
      return dispatch(upsertDomain(domain));
    });
};
