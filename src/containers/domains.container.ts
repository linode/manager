import { connect } from 'react-redux';
import { CreateDomainPayload } from 'src/services/domains';
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
import { ThunkDispatch } from 'src/store/types';

import { updateDomain as _updateDomain } from 'src/store/domains/domains.requests';

export interface StateProps {
  domainsData?: Linode.Domain[];
  domainsLoading: boolean;
  domainsError?: Linode.ApiFieldError[];
}

export interface DomainActionsProps {
  createDomain: (payload: CreateDomainPayload) => Promise<Linode.Domain>;
  updateDomain: (params: UpdateDomainParams) => Promise<Linode.Domain>;
  deleteDomain: (domainId: DomainId) => Promise<{}>;
}

export type Props = StateProps & DomainActionsProps;

export default <InnerStateProps extends {}, TOuter extends {}>(
  mapDomainsToProps: (
    ownProps: TOuter,
    domainsLoading: boolean,
    domains?: Linode.Domain[],
    domainsError?: Linode.ApiFieldError[]
  ) => InnerStateProps
) =>
  connect(
    (state: ApplicationState, ownProps: TOuter) => {
      return mapDomainsToProps(
        ownProps,
        state.__resources.domains.loading,
        state.__resources.domains.entities,
        state.__resources.domains.error
      );
    },
    (dispatch: ThunkDispatch) => ({
      createDomain: (payload: CreateDomainPayload) =>
        dispatch(createDomain(payload)),
      updateDomain: (params: DomainId) => dispatch(updateDomain(params)),
      deleteDomain: (domainId: DomainId) => dispatch(deleteDomain(domainId))
    })
  );
