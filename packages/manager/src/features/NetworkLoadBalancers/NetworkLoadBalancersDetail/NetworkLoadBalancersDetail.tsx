import { useNetworkLoadBalancerQuery } from '@linode/queries';
import { Box, CircleProgress, ErrorState, IconButton } from '@linode/ui';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { EntityDetail } from 'src/components/EntityDetail/EntityDetail';
import { LandingHeader } from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';

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
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          marginBottom: 3,
          width: '100%',
        }}
      >
        <Link
          accessibleAriaLabel="Back to Network Load Balancers"
          data-qa-back-to-nlb
          to="/netloadbalancers"
        >
          <IconButton
            component="span"
            disableFocusRipple
            size="large"
            sx={(theme) => ({
              [theme.breakpoints.down('md')]: {
                marginRight: 0, // Smaller screens
              },
              marginRight: theme.spacingFunction(8),
              padding: 0,
            })}
            tabIndex={-1}
          >
            <KeyboardArrowLeft
              sx={{
                height: 34,
                width: 34,
              }}
            />
          </IconButton>
        </Link>
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
          spacingBottom={0}
          title={nlb.label}
        />
      </Box>
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
