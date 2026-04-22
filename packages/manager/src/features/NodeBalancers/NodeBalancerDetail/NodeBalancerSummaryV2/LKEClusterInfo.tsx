import { Box, Paper, Stack, Typography } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { useKubernetesClusterQuery } from 'src/queries/kubernetes';

import type { NodeBalancer } from '@linode/api-v4';
interface LKEClusterInfoProps {
  nodebalancer: NodeBalancer;
}

export const LKEClusterInfo = ({ nodebalancer }: LKEClusterInfoProps) => {
  // If we can't get the cluster (status === 'error'), we can assume it's been deleted
  const { status: clusterStatus } = useKubernetesClusterQuery({
    enabled: Boolean(nodebalancer?.lke_cluster),
    id: nodebalancer?.lke_cluster?.id ?? -1,
    options: {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
  });

  if (!nodebalancer.lke_cluster) {
    return null;
  }

  return (
    <Paper
      sx={(theme) => ({
        padding: `${theme.spacingFunction(24)}`,
      })}
    >
      <Stack spacing={2}>
        <Typography data-qa-title variant="h2">
          LKE Cluster
        </Typography>
        <Box>
          <Typography data-qa-cluster variant="body1">
            <strong>Cluster: </strong>
            {clusterStatus === 'error' ? (
              <>
                <span style={{ textDecoration: 'line-through' }}>
                  {nodebalancer.lke_cluster.label}
                </span>
                <span style={{ fontStyle: 'italic' }}> (deleted)</span>
              </>
            ) : (
              <>
                <Link
                  accessibleAriaLabel={`Cluster ${nodebalancer.lke_cluster.label}`}
                  to={`/kubernetes/clusters/${nodebalancer.lke_cluster.id}/summary`}
                >
                  {nodebalancer.lke_cluster.label}
                </Link>
                <span>{` (ID: ${nodebalancer.lke_cluster.id})`}</span>
              </>
            )}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
