import {
  useNetworkLoadBalancerListenerQuery,
  useNetworkLoadBalancerQuery,
} from '@linode/queries';
import { CircleProgress, ErrorState, Notice } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';

import { NodesTable } from './NodesTable/NodesTable';

export const NetworkLoadBalancersListenerDetail = () => {
  const params = useParams({ strict: false });
  const { id: nlbId, listenerId } = params;

  const {
    data: nlb,
    error,
    isLoading,
  } = useNetworkLoadBalancerQuery(Number(nlbId) || -1, true);

  const {
    data: listener,
    error: listenerError,
    isLoading: listenerLoading,
  } = useNetworkLoadBalancerListenerQuery(
    Number(nlbId) || -1,
    Number(listenerId) || -1,
    true
  );

  if (isLoading || listenerLoading) {
    return <CircleProgress />;
  }

  if (!nlb || error || !listener || listenerError) {
    return (
      <ErrorState errorText="There was a problem retrieving your NLB. Please try again." />
    );
  }

  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          labelOptions: { noCap: true },
          crumbOverrides: [
            {
              label: 'Network Load Balancer',
              position: 1,
            },
            {
              label: nlb.label,
              position: 2,
              linkTo: `/netloadbalancers/$id/listeners`,
              noCap: true,
            },
          ],
          pathname: `/netloadbalancers/${nlbId}/${listenerId}`,
        }}
        docsLabel="Docs"
        docsLink={
          'https://techdocs.akamai.com/linode-api/changelog/network-load-balancers'
        }
        title={listener.label}
      />
      <Notice variant="info">Listener Detail is coming soon...</Notice>
      <NodesTable listenerId={listener.id} nlbId={nlb.id} />
    </>
  );
};
