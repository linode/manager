import {
  createDomain as _createDomain,
  CreateDomainPayload,
  deleteDomain as _deleteDomain,
  Domain,
  updateDomain as _updateDomain
} from 'linode-js-sdk/lib/domains';
import { APIError } from 'linode-js-sdk/lib/types';
import { createRequestThunk } from '../store.helpers';
import {
  createDomainActions,
  deleteDomainActions,
  DomainId,
  updateDomainActions,
  UpdateDomainParams
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
