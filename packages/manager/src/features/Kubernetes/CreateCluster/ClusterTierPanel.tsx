import { Stack, Typography } from '@linode/ui';
import { useMediaQuery } from '@mui/material';
import React from 'react';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { useAccount } from 'src/queries/account/account';

import {
  StyledSelectionCardHAControlPlaneCopy,
  StyledTiersDocsLinkContainer,
} from './CreateCluster.styles';

import type { KubernetesTier } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';
import { CLUSTER_TIER_DOCS_LINK } from '../constants';

interface Props {
  handleClusterTypeSelection: (tier: KubernetesTier) => void;
  selectedTier: KubernetesTier;
}

export const ClusterTierPanel = (props: Props) => {
  const { handleClusterTypeSelection, selectedTier } = props;

  const { data: account } = useAccount();

  const lgUpBreakpoint = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up('lg')
  );
  const stackColumnBreakpoint = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down(995)
  );
  const smDownBreakpoint = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm')
  );

  const isLkeEnterpriseSelectionDisabled = !account?.capabilities?.includes(
    'Kubernetes Enterprise'
  );

  return (
    <Stack>
      <Stack flexDirection={stackColumnBreakpoint ? 'column' : 'row'}>
        <Stack>
          <Typography variant="h3">Cluster Tier</Typography>
          <Typography sx={{ marginTop: 1, maxWidth: 700 }}>
            Select the cluster tier appropriate for your intended workloads.
            Choose LKE for smaller deployments and a standard array of cluster
            management features or LKE Enterprise for a more robust, scalable,
            and enterprise-grade solution.
          </Typography>
        </Stack>
        <StyledTiersDocsLinkContainer>
          <DocsLink
            href={CLUSTER_TIER_DOCS_LINK}
            label="Compare Cluster Tiers"
          />
        </StyledTiersDocsLinkContainer>
      </Stack>

      <Stack
        flexDirection={smDownBreakpoint ? 'column' : 'row'}
        gap={2}
        marginTop={2}
      >
        <SelectionCard
          subheadings={[
            'Small to medium deployments with standard features',
            'Up to 250 nodes, 1000 pods',
            SharedControlPlaneCopy,
          ]}
          checked={selectedTier === 'standard'}
          heading="LKE"
          onClick={() => handleClusterTypeSelection('standard')}
          sxGrid={{ width: lgUpBreakpoint ? '380px !important' : 'inherit' }}
        />
        <SelectionCard
          subheadings={[
            'Large deployments with enterprise-grade features',
            'Up to 500 nodes, 5000 pods',
            DedicatedControlPlaneCopy,
          ]}
          tooltip={
            isLkeEnterpriseSelectionDisabled
              ? 'LKE Enterprise is not currently enabled on this account. Please contact your account manager or Cloud Computing Sales using the request form or sales@linode.com.'
              : undefined
          }
          checked={selectedTier === 'enterprise'}
          disabled={isLkeEnterpriseSelectionDisabled}
          heading="LKE Enterprise"
          onClick={() => handleClusterTypeSelection('enterprise')}
          tooltipPlacement={smDownBreakpoint ? 'bottom' : 'right'}
          sxGrid={{ width: lgUpBreakpoint ? '380px !important' : 'inherit' }}
        />
      </Stack>
    </Stack>
  );
};

const SharedControlPlaneCopy = (
  <>
    <Typography>
      Shared control plane<span>*</span>
    </Typography>
    <StyledSelectionCardHAControlPlaneCopy>
      *HA control plane can be optionally added
    </StyledSelectionCardHAControlPlaneCopy>
  </>
);

const DedicatedControlPlaneCopy = (
  <>
    <Typography>
      Dedicated control plane<span>*</span>
    </Typography>
    <StyledSelectionCardHAControlPlaneCopy>
      *HA control plane is included
    </StyledSelectionCardHAControlPlaneCopy>
  </>
);
