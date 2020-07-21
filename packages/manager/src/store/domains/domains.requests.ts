import {
  createDomain as _createDomain,
  CreateDomainPayload,
  deleteDomain as _deleteDomain,
  Domain,
  getDomain,
  getDomains,
  updateDomain as _updateDomain
} from '@linode/api-v4/lib/domains';
import { getUserPreferences } from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { Dispatch } from 'redux';
import { LARGE_ACCOUNT_THRESHOLD } from 'src/constants';
import { updateUserPreferences } from 'src/store/preferences/preferences.requests';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { ThunkActionCreator } from '../types';
import {
  createDomainActions,
  deleteDomainActions,
  DomainId,
  getDomainsActions,
  getDomainsPageActions,
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
  dispatch: Dispatch<any>,
  getState
) => {
  dispatch(getDomainsActions.started());

  return getAll<Domain>(getDomains)()
    .then(domains => {
      if (domains.results > LARGE_ACCOUNT_THRESHOLD) {
        const isMarkedAsLargeAccount =
          getState().preferences?.data?.is_large_account ?? false;

        // If we haven't already marked this account as large, do that here.
        // @todo remove all this logic once ARB-2091 is merged.
        if (!isMarkedAsLargeAccount) {
          getUserPreferences().then(response => {
            const updatedPreferences = {
              ...response.data,
              is_large_account: true
            };
            dispatch(updateUserPreferences(updatedPreferences));
          });
        }
      }
      dispatch(getDomainsActions.done({ result: domains }));
      return domains.data;
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
export const requestDomainForStore: RequestDomainForStoreThunk = id => dispatch => {
  getDomain(id).then(domain => {
    return dispatch(upsertDomain(domain));
  });
};

/**
 * Single page of Domains (for use on Dashboard etc.)
 */
export const getDomainsPage = createRequestThunk(
  getDomainsPageActions,
  ({ params, filters }) => getDomains(params, filters)
);
