import { pathOr } from 'ramda';
import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { getDomain, getDomains } from 'src/services/domains';
import { getAll } from 'src/utilities/getAll';
import actionCreatorFactory from 'typescript-fsa';

/**
 * Actions
 */
const actionCreator = actionCreatorFactory(`@@manager/domains`);

export const getDomainsRequest = actionCreator('request');

export const getDomainsSuccess = actionCreator<Linode.Domain[]>('success');

export const getDomainsFailure = actionCreator<Linode.ApiFieldError[]>('fail');

export const addDomain = actionCreator<Linode.Domain>('add');

export const updateDomain = actionCreator<Linode.Domain>('update');

export const deleteDomain = actionCreator<number>('delete');

/**
 * Async
 */
export const requestDomains = () => (dispatch: Dispatch<any>) => {

  dispatch(getDomainsRequest());

  return getAll<Linode.Domain>(getDomains)()
    .then((domains) => {
      dispatch(getDomainsSuccess(domains.data));
      return domains;
    })
    .catch((err) => {
      const defaultError = [{ reason: 'An unexpected error has occurred.' }];
      const errors = pathOr(defaultError, ['response', 'data', 'errors'], err);
      dispatch(getDomainsFailure(errors));
    });
};

type RequestDomainForStoreThunk = (id: number) => ThunkAction<void, ApplicationState, undefined>;
export const requestDomainForStore: RequestDomainForStoreThunk = (id) => (dispatch, getState) => {
  const { results } = getState().__resources.domains;

  getDomain(id)
    .then(response => response)
    .then(domain => {
      if (results.includes(id)) {
        return dispatch(updateDomain(domain));
      }
      return dispatch(addDomain(domain))
    })

};
