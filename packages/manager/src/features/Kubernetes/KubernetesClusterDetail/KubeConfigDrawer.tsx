import { Box, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

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
      <Box display="flex">
        <Typography mr={2} variant="h3">
          {clusterLabel}
        </Typography>
        <StyledDownloadButton
          onClick={() =>
            downloadFile(`${clusterLabel}-kubeconfig.yaml`, data ?? '')
          }
          title="Download"
        >
          <Download />
        </StyledDownloadButton>
      </Box>
      <CodeBlock
        command={data ?? ''}
        commandType="Kube Config Yaml"
        handleCopyIconClick={() => null}
        language="yaml"
      />
    </Drawer>
  );
};

export const StyledDownloadButton = styled('button', {
  label: 'StyledDownloadButton',
})(({ theme }) => ({
  '& svg': {
    color: '#3683dc',
  },
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  font: 'inherit',
  marginRight: theme.spacing(1),
  padding: 0,
}));
