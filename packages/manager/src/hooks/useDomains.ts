import { Domain } from 'linode-js-sdk/lib/domains/types';
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State } from 'src/store/domains/domains.reducer';
import { requestDomains as _request } from 'src/store/domains/domains.requests';
import { Dispatch } from './types';

export interface DomainsProps {
  domains: State;
  requestDomains: () => Promise<Domain[]>;
}

export const useDomains = (): DomainsProps => {
  const dispatch: Dispatch = useDispatch();
  const domains = useSelector(
    (state: ApplicationState) => state.__resources.domains
  );
  const requestDomains = () => dispatch(_request());

  return { domains, requestDomains };
};

export default useDomains;
