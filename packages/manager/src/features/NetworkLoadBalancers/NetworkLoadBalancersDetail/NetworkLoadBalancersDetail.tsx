import { useNetworkLoadBalancerQuery } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { EntityDetail } from 'src/components/EntityDetail/EntityDetail';
import { LandingHeader } from 'src/components/LandingHeader';

import { NLB_API_DOCS_LINK } from '../constants';
import { NetworkLoadBalancerDetailBody } from './NetworkLoadBalancerDetailBody';
import { NetworkLoadBalancerDetailHeader } from './NetworkLoadBalancerDetailHeader';
import { NetworkLoadBalancersListenerTable } from './NetworkLoadBalancersListenerTable';

const NetworkLoadBalancersDetail = () => {
  const params = useParams({ strict: false });
  const { id } = params;

  const {
    data: nlb,
    error,
    isLoading,
  } = useNetworkLoadBalancerQuery(Number(id) || -1, true);

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!nlb || error) {
    return (
      <ErrorState errorText="There was a problem retrieving your NLB. Please try again." />
    );
  }

  return (
    <>
      <DocumentTitleSegment segment={`${nlb.label} | Network Load Balancer`} />
      <LandingHeader
        breadcrumbProps={{
          labelOptions: { noCap: true },
          crumbOverrides: [
            {
              label: 'Network Load Balancer',
              position: 1,
            },
          ],
          pathname: `/netloadbalancers/${nlb.id}`,
        }}
        docsLabel="Docs"
        docsLink={NLB_API_DOCS_LINK}
        title={nlb.label}
      />
      <EntityDetail
        body={
          <NetworkLoadBalancerDetailBody
            addressV4={nlb.address_v4}
            addressV6={nlb.address_v6}
            createdDate={nlb.created}
            lkeCluster={nlb.lke_cluster}
            nlbId={nlb.id}
            region={nlb.region}
            updatedDate={nlb.updated}
          />
        }
        header={<NetworkLoadBalancerDetailHeader status={nlb.status} />}
        noBodyBottomBorder={true}
      />
      <NetworkLoadBalancersListenerTable nlbId={nlb.id} />
    </>
  );
};

export default NetworkLoadBalancersDetail;
