import { Chip, Stack } from '@linode/ui';
import { useLocation } from '@tanstack/react-router';
import React from 'react';

import { useIsLkeEnterpriseEnabled } from '../kubeUtils';

import type { KubernetesCluster } from '@linode/api-v4';
import type { SxProps, Theme } from '@mui/material';

interface Props {
  cluster: KubernetesCluster;
  sx?: SxProps<Theme>;
}

export const ClusterChips = (props: Props) => {
  const { cluster, sx } = props;
  const { isLkeEnterpriseLAFeatureEnabled } = useIsLkeEnterpriseEnabled();

  const location = useLocation({ select: (location) => location.pathname });

  return (
    <Stack columnGap={0.5} flexDirection="row" sx={sx}>
      {isLkeEnterpriseLAFeatureEnabled && cluster?.tier === 'enterprise' && (
        <Chip
          data-testid="lke-e-chip"
          label="ENTERPRISE"
          size="small"
          sx={(theme) => ({ borderColor: theme.color.blue })}
          variant="outlined"
        />
      )}
      {cluster.control_plane.high_availability && (
        <Chip
          data-testid="ha-chip"
          label={location === '/kubernetes/clusters' ? 'HA' : 'HA CLUSTER'}
          size="small"
          sx={(theme) => ({ borderColor: theme.color.green })}
          variant="outlined"
        />
      )}
    </Stack>
  );
};
