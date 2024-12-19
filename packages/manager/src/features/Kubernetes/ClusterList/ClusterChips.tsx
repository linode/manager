import { Chip, Stack } from '@linode/ui';
import React from 'react';
import { useHistory } from 'react-router-dom';

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

  const { location } = useHistory();

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
          label={
            location.pathname === '/kubernetes/clusters' ? 'HA' : 'HA CLUSTER'
          }
          data-testid="ha-chip"
          size="small"
          sx={(theme) => ({ borderColor: theme.color.green })}
          variant="outlined"
        />
      )}
    </Stack>
  );
};
