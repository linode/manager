import { CreateDomainPayload, Domain } from 'linode-js-sdk/lib/domains';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';
import {
  DomainId,
  UpdateDomainParams
} from 'src/store/domains/domains.actions';
import {
  createDomain,
  deleteDomain,
  updateDomain
} from 'src/store/domains/domains.requests';
import { EntityError, ThunkDispatch } from 'src/store/types';

export interface StateProps {
  domainsData?: Domain[];
  domainsLoading: boolean;
  domainsError: EntityError;
}

export interface DomainActionsProps {
  createDomain: (payload: CreateDomainPayload) => Promise<Domain>;
  updateDomain: (params: UpdateDomainParams & DomainId) => Promise<Domain>;
  deleteDomain: (domainId: DomainId) => Promise<{}>;
}

export type Props = StateProps & DomainActionsProps;

export default <InnerStateProps extends {}, TOuter extends {}>(
  mapDomainsToProps: (
    ownProps: TOuter,
    domainsLoading: boolean,
    domainsError: EntityError,
    domains?: Domain[]
  ) => InnerStateProps
) =>
  connect(
    (state: ApplicationState, ownProps: TOuter) => {
      return mapDomainsToProps(
        ownProps,
        state.__resources.domains.loading,
        state.__resources.domains.error,
        state.__resources.domains.data
      );
    },
    (dispatch: ThunkDispatch) => ({
      createDomain: (payload: CreateDomainPayload) =>
        dispatch(createDomain(payload)),
      updateDomain: (params: UpdateDomainParams & DomainId) =>
        dispatch(updateDomain(params)),
      deleteDomain: (domainId: DomainId) => dispatch(deleteDomain(domainId))
    })
  );
