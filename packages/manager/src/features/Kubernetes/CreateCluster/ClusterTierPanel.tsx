import { Stack, Typography } from '@linode/ui';
import { useMediaQuery } from '@mui/material';
import React from 'react';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';
import { useAccount } from '@linode/queries';

import { CLUSTER_TIER_DOCS_LINK } from '../constants';
import {
  StyledDocsLinkContainer,
  StyledStackWithTabletBreakpoint,
} from './CreateCluster.styles';

import type { KubernetesTier } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

interface Props {
  handleClusterTierSelection: (tier: KubernetesTier) => void;
  isUserRestricted: boolean;
  selectedTier: KubernetesTier;
}

export const ClusterTierPanel = (props: Props) => {
  const { handleClusterTierSelection, isUserRestricted, selectedTier } = props;

  const { data: account } = useAccount();

  const smDownBreakpoint = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm')
  );

  const isLkeEnterpriseSelectionDisabled = !account?.capabilities?.includes(
    'Kubernetes Enterprise'
  );

  return (
    <Stack>
      <StyledStackWithTabletBreakpoint>
        <Stack>
          <Typography variant="h3">Cluster Tier</Typography>
          <Typography sx={{ marginTop: 1, maxWidth: 700 }}>
            Select the cluster tier that’s appropriate for your intended
            workloads. Choose LKE for smaller deployments or LKE Enterprise for
            a more scalable, enterprise-grade solution.
          </Typography>
        </Stack>
        <StyledDocsLinkContainer>
          <DocsLink href={CLUSTER_TIER_DOCS_LINK} label="Compare Tiers" />
        </StyledDocsLinkContainer>
      </StyledStackWithTabletBreakpoint>

      <Stack
        flexDirection={smDownBreakpoint ? 'column' : 'row'}
        gap={2}
        marginTop={2}
      >
        <SelectionCard
          checked={selectedTier === 'standard' && !isUserRestricted}
          disabled={isUserRestricted}
          heading="LKE"
          onClick={() => handleClusterTierSelection('standard')}
          subheadings={[StandardSubheadings]}
          sxCardBase={{ padding: '16px' }}
        />
        <SelectionCard
          tooltip={
            isLkeEnterpriseSelectionDisabled && !isUserRestricted
              ? 'LKE Enterprise is not currently enabled on this account. Please contact your account manager or our sales team using the request form or sales@linode.com.'
              : undefined
          }
          checked={selectedTier === 'enterprise' && !isUserRestricted}
          disabled={isLkeEnterpriseSelectionDisabled || isUserRestricted}
          heading="LKE Enterprise"
          onClick={() => handleClusterTierSelection('enterprise')}
          subheadings={[EnterpriseSubheadings]}
          sxCardBase={{ padding: '16px' }}
          tooltipPlacement={smDownBreakpoint ? 'bottom' : 'right'}
        />
      </Stack>
    </Stack>
  );
};

const StandardSubheadings = (
  <Typography sx={{ marginTop: '4px' }}>
    Small to medium deployments <br />
    Up to 250 nodes, 1000 pods <br />
    Shared control plane <br />
  </Typography>
);

const EnterpriseSubheadings = (
  <Typography sx={{ marginTop: '4px' }}>
    Large deployments <br />
    Up to 500 nodes, 5000 pods <br />
    Dedicated HA control plane <br />
  </Typography>
);
