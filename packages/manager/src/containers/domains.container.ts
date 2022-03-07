import { CreateDomainPayload, Domain } from '@linode/api-v4/lib/domains';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';
import {
  DomainId,
  UpdateDomainParams,
  upsertDomain,
} from 'src/store/domains/domains.actions';
import {
  createDomain,
  deleteDomain,
  getDomainsPage as getPage,
  requestDomains as getAll,
  updateDomain,
} from 'src/store/domains/domains.requests';
import { EntityError, ThunkDispatch } from 'src/store/types';
import { Action } from 'typescript-fsa';

export interface StateProps {
  domainsData?: Domain[];
  domainsLoading: boolean;
  domainsError: EntityError;
  domainsLastUpdated: number;
  domainsResults: number;
}

export interface DomainActionsProps {
  createDomain: (payload: CreateDomainPayload) => Promise<Domain>;
  updateDomain: (params: UpdateDomainParams & DomainId) => Promise<Domain>;
  deleteDomain: (domainId: DomainId) => Promise<{}>;
  getAllDomains: () => Promise<Domain[]>;
  getDomainsPage: (params?: any, filters?: any) => Promise<Domain[]>;
  upsertDomain: (domain: Domain) => Action<Domain>;
}

export type Props = StateProps & DomainActionsProps;

export default <InnerStateProps extends {}, TOuter extends {}>(
  mapDomainsToProps?: (
    ownProps: TOuter,
    domainsData: Domain[],
    domainsLoading: boolean,
    domainsError: EntityError,
    domainsResults: number,
    domainsLastUpdated: number
  ) => InnerStateProps
) =>
  connect(
    (state: ApplicationState, ownProps: TOuter) => {
      const { domains } = state.__resources;
      if (mapDomainsToProps) {
        return mapDomainsToProps(
          ownProps,
          Object.values(domains.itemsById),
          domains.loading,
          domains.error,
          domains.results,
          domains.lastUpdated
        );
      }

      return {
        domainsLoading: domains.loading,
        domainsError: domains.error,
        domainsData: Object.values(domains.itemsById),
        domainsResults: domains.results,
        domainsLastUpdated: domains.lastUpdated,
      };
    },
    (dispatch: ThunkDispatch) => ({
      createDomain: (payload: CreateDomainPayload) =>
        dispatch(createDomain(payload)),
      updateDomain: (params: UpdateDomainParams & DomainId) =>
        dispatch(updateDomain(params)),
      deleteDomain: (domainId: DomainId) => dispatch(deleteDomain(domainId)),
      getDomainsPage: (params?: any, filters?: any) =>
        dispatch(getPage({ params, filters })),
      getAllDomains: () => dispatch(getAll()),
      upsertDomain: (domain: Domain) => dispatch(upsertDomain(domain)),
    })
  );
