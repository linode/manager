import { CreateDomainPayload, Domain } from 'linode-js-sdk/lib/domains';
import { connect } from 'react-redux';
import { ThunkDispatch } from '../types';
import { DomainId, UpdateDomainParams } from './domains.actions';
import { createDomain, deleteDomain, updateDomain } from './domains.requests';

export interface DomainActionsProps {
  domainActions: {
    createDomain: (payload: CreateDomainPayload) => Promise<Domain>;
    updateDomain: (params: UpdateDomainParams) => Promise<Domain>;
    deleteDomain: (domainId: DomainId) => Promise<{}>;
  };
}

export const withDomainActions = connect(
  undefined,
  (dispatch: ThunkDispatch) => ({
    domainActions: {
      createDomain: (payload: CreateDomainPayload) =>
        dispatch(createDomain(payload)),
      updateDomain: (params: DomainId) => dispatch(updateDomain(params)),
      deleteDomain: (domainId: DomainId) => dispatch(deleteDomain(domainId))
    }
  })
);

export default withDomainActions;
