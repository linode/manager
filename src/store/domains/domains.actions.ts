import { pathOr } from 'ramda';
import { Dispatch } from 'redux';
import { getDomain, getDomains } from 'src/services/domains';
import { RequestThunk } from 'src/store/types';
import { getAll } from 'src/utilities/getAll';
import actionCreatorFactory from 'typescript-fsa';

type Entity = Linode.Domain;
/**
 * Actions
 */
const actionCreator = actionCreatorFactory(`@@manager/domains`);

export const getDomainsRequest = actionCreator('request');

export const getDomainsSuccess = actionCreator<Entity[]>('success');

export const getDomainsFailure = actionCreator<Linode.ApiFieldError[]>('fail');

export const upsertDomain = actionCreator<Entity>('upsert');

export const deleteDomain = actionCreator<number>('delete');

/**
 * Async
 */
export const requestDomains = () => (dispatch: Dispatch<any>) => {

  dispatch(getDomainsRequest());

  return getAll<Entity>(getDomains)()
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
export const requestDomainForStore: RequestThunk<Entity> = (id) => (dispatch, getState) => {

  const { results } = getState().__resources.domains;

  return getDomain(id)
    .then(response => response)
    .then(domain => {
      if (results.includes(id)) {
        dispatch(upsertDomain(domain));
        return domain;
      }
      dispatch(upsertDomain(domain))
      return domain;
    })

};
