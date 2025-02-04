import { Box, IconButton, Typography } from '@linode/ui';
import React from 'react';

import Download from 'src/assets/icons/download.svg';
import { CodeBlock } from 'src/components/CodeBlock/CodeBlock';
import { Drawer } from 'src/components/Drawer';
import { useKubernetesKubeConfigQuery } from 'src/queries/kubernetes';
import { downloadFile } from 'src/utilities/downloadFile';

interface Props {
  closeDrawer: () => void;
  clusterId: number;
  clusterLabel: string;
  open: boolean;
}

export const KubeConfigDrawer = (props: Props) => {
  const { closeDrawer, clusterId, clusterLabel, open } = props;

  const { data, failureReason, isFetching } = useKubernetesKubeConfigQuery(
    clusterId,
    open
  );

  return (
    <Drawer
      error={failureReason}
      isFetching={isFetching}
      onClose={closeDrawer}
      open={open}
      title="View Kubeconfig"
      wide
    >
      <Box alignItems="center" display="flex" gap={1.5}>
        <Typography variant="h3">{clusterLabel}</Typography>
        <IconButton
          onClick={() =>
            downloadFile(`${clusterLabel}-kubeconfig.yaml`, data ?? '')
          }
          sx={{ mt: 0.5, p: 0.5 }}
          title="Download"
        >
          <Download height="16px" width="16px" />
        </IconButton>
      </Box>
      <CodeBlock
        code={(data ?? '').trim()}
        analyticsLabel="Kube Config Yaml"
        handleCopyIconClick={() => null}
        language="yaml"
      />
    </Drawer>
  );
};
