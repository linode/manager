import * as React from 'react';
import { useParams } from 'react-router-dom';
import { CircleProgress } from 'src/components/CircleProgress';
import NotFound from 'src/components/NotFound';
import { useDomainQuery } from 'src/queries/domains';
import ErrorState from 'src/components/ErrorState';

const DomainsLanding = React.lazy(() => import('../DomainsLanding'));
const DomainDetail = React.lazy(() => import('./DomainDetail'));

const DomainDetailRouting = () => {
  const params = useParams<{ domainId: string }>();
  const domainId = Number(params.domainId);

  const { data: domain, isLoading, error } = useDomainQuery(domainId);

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText="Unable to load this domain." />;
  }

  if (!domain) {
    return <NotFound />;
  }

  // Primary Domains have a Detail page.
  if (domain.type === 'master') {
    return <DomainDetail />;
  }

  // Secondary Domains do not have a Detail page, so render the Landing
  // page with an open drawer.
  return <DomainsLanding domainForEditing={domain} />;
};

export default DomainDetailRouting;
