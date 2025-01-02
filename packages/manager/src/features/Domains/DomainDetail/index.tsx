import { CircleProgress } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { NotFound } from 'src/components/NotFound';
import { useDomainQuery } from 'src/queries/domains';

const DomainsLanding = React.lazy(() =>
  import('../DomainsLanding').then((module) => ({
    default: module.DomainsLanding,
  }))
);
const DomainDetail = React.lazy(() =>
  import('./DomainDetail').then((module) => ({ default: module.DomainDetail }))
);

export const DomainDetailRouting = () => {
  const params = useParams({ from: '/domains/$domainId' });
  const domainId = params.domainId;

  const { data: domain, error, isLoading } = useDomainQuery(domainId);

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
