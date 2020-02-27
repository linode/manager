import {
  createDomain as _createDomain,
  CreateDomainPayload,
  deleteDomain as _deleteDomain,
  Domain,
  getDomain,
  getDomains,
  updateDomain as _updateDomain
} from 'linode-js-sdk/lib/domains';
import { APIError } from 'linode-js-sdk/lib/types';
import { Dispatch } from 'redux';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import {
  createDomainActions,
  deleteDomainActions,
  DomainId,
  getDomainsActions,
  updateDomainActions,
  UpdateDomainParams,
  upsertDomain
} from './domains.actions';

export const createDomain = createRequestThunk<
  CreateDomainPayload,
  Domain,
  APIError[]
>(createDomainActions, payload => _createDomain(payload));

export const deleteDomain = createRequestThunk<DomainId, {}, APIError[]>(
  deleteDomainActions,
  ({ domainId }) => _deleteDomain(domainId)
);

export const updateDomain = createRequestThunk<
  UpdateDomainParams,
  Domain,
  APIError[]
>(updateDomainActions, ({ domainId, ...payload }) =>
  _updateDomain(domainId, payload)
);

export const requestDomains: ThunkActionCreator<Promise<Domain[]>> = () => (
  dispatch: Dispatch<any>
) => {
  dispatch(getDomainsActions.started());

  return getAll<Domain>(getDomains)()
    .then(domains => {
      dispatch(getDomainsActions.done({ result: domains }));
      return domains;
    })
    .catch(err => {
      const errors = getAPIErrorOrDefault(
        err,
        'There was an error retrieving your Domains.'
      );
      dispatch(getDomainsActions.failed({ error: errors }));
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
