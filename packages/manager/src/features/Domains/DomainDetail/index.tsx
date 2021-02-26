import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import NotFound from 'src/components/NotFound';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import useDomains from 'src/hooks/useDomains';
const DomainsLanding = React.lazy(() => import('../DomainsLanding'));
const DomainDetail = React.lazy(() => import('./DomainDetail'));

export const DomainDetailRouting: React.FC<RouteComponentProps<{
  domainId: string;
}>> = props => {
  const domainId = Number(props.match.params.domainId);
  const { domains, requestDomain } = useDomains();
  const request = useAPIRequest(() => requestDomain(domainId), undefined);

  // The Domain from the store that matches this ID.
  const foundDomain = Object.values(domains.itemsById).find(
    thisDomain => thisDomain.id === domainId
  );

  if (!foundDomain) {
    // Did we complete a request for Domains yet? If so, this Domain doesn't exist.
    if (!request.loading && request.lastUpdated > 0) {
      return <NotFound />;
    }
    // If not, we don't know if the Domain exists yet so we have to stall
    return <CircleProgress />;
  }
  // Primary Domains have a Detail page.
  if (foundDomain.type === 'master') {
    return <DomainDetail {...props} />;
  }

  // Secondary Domains do not have a Detail page, so render the Landing
  // page with an open drawer.
  return (
    <DomainsLanding
      domainForEditing={{
        domainId: foundDomain.id,
        domainLabel: foundDomain.domain,
      }}
      {...props}
    />
  );
};

export default DomainDetailRouting;
