import { Dispatch } from 'redux';
import {
  CreateDomainPayload,
  getDomain,
  getDomains,
  UpdateDomainPayload
} from 'src/services/domains';
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

export const getDomainsSuccess = actionCreator<Linode.Domain[]>('success');

export const getDomainsFailure = actionCreator<Linode.ApiFieldError[]>('fail');

export const upsertDomain = actionCreator<Linode.Domain>('upsert');

export const deleteDomain = actionCreator<number>('delete');

export const createDomainActions = actionCreator.async<
  CreateDomainPayload,
  Linode.Domain,
  Linode.ApiFieldError[]
>('create');
export const updateDomainActions = actionCreator.async<
  UpdateDomainParams,
  Linode.Domain,
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
export const requestDomains: ThunkActionCreator<
  Promise<Linode.Domain[]>
> = () => (dispatch: Dispatch<any>) => {
  dispatch(getDomainsRequest());

  return getAll<Linode.Domain>(getDomains)()
    .then(domains => {
      dispatch(getDomainsSuccess(domains.data));
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

type RequestDomainForStoreThunk = ThunkActionCreator<void>;
export const requestDomainForStore: RequestDomainForStoreThunk = id => (
  dispatch,
  getState
) => {
  const { results } = getState().__resources.domains;

  getDomain(id)
    .then(response => response)
    .then(domain => {
      if (results.includes(id)) {
        return dispatch(upsertDomain(domain));
      }
      return dispatch(upsertDomain(domain));
    });
};
