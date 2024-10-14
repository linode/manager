import { styled } from '@mui/material/styles';
import * as React from 'react';

import Download from 'src/assets/icons/download.svg';
import { Box } from 'src/components/Box';
import { CodeBlock } from 'src/components/CodeBlock/CodeBlock';
import { Drawer } from 'src/components/Drawer';
import { DrawerContent } from 'src/components/DrawerContent';
import { Typography } from 'src/components/Typography';
import { useKubenetesKubeConfigQuery } from 'src/queries/kubernetes';
import { downloadFile } from 'src/utilities/downloadFile';

interface Props {
  closeDrawer: () => void;
  clusterId: number;
  clusterLabel: string;
  open: boolean;
}

export const KubeConfigDrawer = (props: Props) => {
  const { closeDrawer, clusterId, clusterLabel, open } = props;

  const {
    data,
    error,
    isFetching,
    isLoading,
    refetch,
  } = useKubenetesKubeConfigQuery(clusterId, open);

  // refetchOnMount isnt good enough for this query because
  // it is already mounted in the rendered Drawer
  React.useEffect(() => {
    if (open && !isLoading && !isFetching) {
      refetch();
    }
  }, [open]);

  return (
    <Drawer onClose={closeDrawer} open={open} title="View Kubeconfig" wide>
      <DrawerContent
        error={!!error}
        errorMessage={error?.[0].reason}
        loading={isLoading}
        title={clusterLabel}
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
      </DrawerContent>
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
