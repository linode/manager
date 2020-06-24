import { Domain } from '@linode/api-v4/lib/domains/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import {
  DomainId,
  UpdateDomainParams
} from 'src/store/domains/domains.actions';
import { State } from 'src/store/domains/domains.reducer';
import {
  requestDomains as _request,
  updateDomain as _update
} from 'src/store/domains/domains.requests';
import { Dispatch } from './types';

export interface DomainsProps {
  domains: State;
  requestDomains: () => Promise<Domain[]>;
  updateDomain: (params: UpdateDomainParams & DomainId) => Promise<Domain>;
}

export const useDomains = (): DomainsProps => {
  const dispatch: Dispatch = useDispatch();
  const domains = useSelector(
    (state: ApplicationState) => state.__resources.domains
  );
  const requestDomains = () => dispatch(_request());
  const updateDomain = (params: DomainId & UpdateDomainParams) =>
    dispatch(_update(params));

  return { domains, requestDomains, updateDomain };
};

export default useDomains;
