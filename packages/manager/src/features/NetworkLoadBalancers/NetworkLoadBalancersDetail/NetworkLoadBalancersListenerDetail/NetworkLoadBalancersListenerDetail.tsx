import {
  useNetworkLoadBalancerNodesQuery,
  useNetworkLoadBalancerQuery,
} from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { EntityDetail } from 'src/components/EntityDetail/EntityDetail';
import { LandingHeader } from 'src/components/LandingHeader';

import { NLB_API_DOCS_LINK } from '../../constants';
import { NetworkLoadBalancersListenerDetailBody } from './NetworkLoadBalancersListenerDetailBody';
import { NetworkLoadBalancersListenerDetailHeader } from './NetworkLoadBalancersListenerDetailHeader';
import { NodesTable } from './NodesTable/NodesTable';

const NetworkLoadBalancersListenerDetail = () => {
  const { id, listenerId } = useParams({
    from: '/netloadbalancers/$id/listeners/$listenerId/nodes',
  });

  const { data: nlb, error, isLoading } = useNetworkLoadBalancerQuery(id);

  // Fetch nodes for this listener
  const { data: nodesData, isLoading: nodesLoading } =
    useNetworkLoadBalancerNodesQuery(id, listenerId);

  const listener = nlb?.listeners?.find((l) => l.id === listenerId);

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!nlb || error || !listener) {
    return (
      <ErrorState errorText="There was a problem retrieving your listener. Please try again." />
    );
  }

  return (
    <>
      <DocumentTitleSegment segment={`Listener ${listener.label}`} />
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
              linkTo: '/netloadbalancers/$id/listeners',
            },
          ],
          pathname: `/netloadbalancers/${id}/listeners/${listenerId}`,
        }}
        docsLabel="Docs"
        docsLink={NLB_API_DOCS_LINK}
        removeCrumbX={2}
        title={`${listener.label}`}
      />
      <EntityDetail
        body={
          <NetworkLoadBalancersListenerDetailBody
            created={listener.created}
            nodes={nodesData?.results ?? 0}
            nodesLoading={nodesLoading}
            port={listener.port}
            protocol={listener.protocol}
            updated={listener.updated}
          />
        }
        header={
          <NetworkLoadBalancersListenerDetailHeader label={listener.label} />
        }
        noBodyBottomBorder={true}
      />
      <NodesTable listenerId={listener.id} nlbId={nlb.id} />
    </>
  );
};

export default NetworkLoadBalancersListenerDetail;
