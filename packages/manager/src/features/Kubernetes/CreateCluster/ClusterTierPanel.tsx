import { Stack, Typography } from '@linode/ui';
import { useMediaQuery } from '@mui/material';
import React from 'react';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { useAccount } from 'src/queries/account/account';

import { StyledDocsLinkContainer } from './CreateCluster.styles';

import type { KubernetesTier } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

interface Props {
  handleClusterTypeSelection: (tier: KubernetesTier) => void;
  selectedTier: KubernetesTier;
}

export const ClusterTierPanel = (props: Props) => {
  const { handleClusterTypeSelection, selectedTier } = props;

  const { data: account } = useAccount();

  const mdDownBreakpoint = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('md')
  );
  const smDownBreakpoint = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm')
  );

  const isLkeEnterpriseSelectionDisabled = !account?.capabilities?.includes(
    'Kubernetes Enterprise'
  );

  return (
    <Stack>
      <Stack flexDirection={mdDownBreakpoint ? 'column' : 'row'}>
        <Stack>
          <Typography variant="h3">Cluster Tier</Typography>
          <Typography sx={{ marginTop: 1, maxWidth: 700 }}>
            Select the cluster tier appropriate for your intended workloads.
            Choose LKE for smaller deployments and a standard array of cluster
            management features or LKE Enterprise for a more robust, scalable,
            and enterprise-grade solution.
          </Typography>
        </Stack>
        <StyledDocsLinkContainer>
          <DocsLink
            href="https://techdocs.akamai.com/cloud-computing/docs/linode-kubernetes-engine"
            label="Compare Cluster Tiers"
          />
        </StyledDocsLinkContainer>
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
    <Typography fontSize={12} fontStyle="italic">
      *HA control plane can be optionally added
    </Typography>
  </>
);

const DedicatedControlPlaneCopy = (
  <>
    <Typography>
      Dedicated control plane<span>*</span>
    </Typography>
    <Typography fontSize={12} fontStyle="italic">
      *HA control plane is included
    </Typography>
  </>
);
