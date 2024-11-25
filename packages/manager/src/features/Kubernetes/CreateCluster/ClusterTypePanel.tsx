import { Stack } from '@linode/ui';
import { Typography } from '@mui/material';
import React from 'react';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { SelectionCard } from 'src/components/SelectionCard/SelectionCard';

import { StyledDocsLinkContainer } from './CreateCluster.styles';

import type { KubernetesTier } from '@linode/api-v4';
import { useAccount } from 'src/queries/account/account';

interface Props {
  handleClusterTypeSelection: (tier: KubernetesTier) => void;
  selectedTier: KubernetesTier;
}

export const ClusterTypePanel = (props: Props) => {
  const { handleClusterTypeSelection, selectedTier } = props;

  const { data: account } = useAccount();

  const isLkeEnterpriseSelectionDisabled = !account?.capabilities?.includes(
    'Kubernetes Enterprise'
  );

  return (
    <Stack>
      <Stack flexDirection="row">
        <Stack>
          <Typography variant="h3">Cluster Type</Typography>
          <Typography sx={{ marginTop: 1, maxWidth: 700 }}>
            Choose from a managed solution for smaller deployments or enterprise
            grade clusters with enhanced ingress, networking, and security.
          </Typography>
        </Stack>
        <StyledDocsLinkContainer>
          <DocsLink href="/" label="Full Cluster Features" />
        </StyledDocsLinkContainer>
      </Stack>

      <Stack flexDirection="row" gap={2} marginTop={2}>
        <SelectionCard
          subheadings={[
            'Up to 250 nodes, 1000 pods',
            'Shared control plane',
            'HA control plane (optional)',
          ]}
          checked={selectedTier === 'standard'}
          heading={'LKE'}
          onClick={() => handleClusterTypeSelection('standard')}
        />
        <SelectionCard
          subheadings={[
            'Up to 500 nodes, 5000 pods',
            'Dedicated control plane',
            'HA control plane (included)',
          ]}
          checked={selectedTier === 'enterprise'}
          heading={'LKE Enterprise'}
          onClick={() => handleClusterTypeSelection('enterprise')}
          disabled={isLkeEnterpriseSelectionDisabled}
          sxTooltip={{ width: 700 }}
          tooltip={
            isLkeEnterpriseSelectionDisabled
              ? 'LKE Enterprise is not currently enabled on this contract. To inquire, fill out the Cloud Computing Sales form or email sales@linode.com.'
              : undefined
          }
          tooltipPlacement="bottom"
        />
      </Stack>
    </Stack>
  );
};
