import {
  createDomain as _createDomain,
  CreateDomainPayload,
  deleteDomain as _deleteDomain,
  Domain,
  updateDomain as _updateDomain
} from 'linode-js-sdk/lib/domains';
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
  Linode.ApiFieldError[]
>(createDomainActions, payload => _createDomain(payload));

export const deleteDomain = createRequestThunk<
  DomainId,
  {},
  Linode.ApiFieldError[]
>(deleteDomainActions, ({ domainId }) => _deleteDomain(domainId));

export const updateDomain = createRequestThunk<
  UpdateDomainParams,
  Domain,
  Linode.ApiFieldError[]
>(updateDomainActions, ({ domainId, ...payload }) =>
  _updateDomain(domainId, payload)
);
