import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import Download from 'src/assets/icons/download.svg';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Drawer } from 'src/components/Drawer';
import { DrawerContent } from 'src/components/DrawerContent';
import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';
import { Typography } from 'src/components/Typography';
import { useKubenetesKubeConfigQuery } from 'src/queries/kubernetes';
import { downloadFile } from 'src/utilities/downloadFile';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    color: '#3683dc',
  },
  iconLink: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    font: 'inherit',
    marginRight: theme.spacing(1),
    padding: 0,
  },
  tooltip: {
    '& svg': {
      color: '#3683dc',
    },
  },
}));

interface Props {
  closeDrawer: () => void;
  clusterId: number;
  clusterLabel: string;
  open: boolean;
}

export const KubeConfigDrawer = (props: Props) => {
  const classes = useStyles();
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
    <Drawer onClose={closeDrawer} open={open} title={'View Kubeconfig'} wide>
      <DrawerContent
        error={!!error}
        errorMessage={error?.[0].reason}
        loading={isLoading}
        title={clusterLabel}
      >
        <Grid container spacing={2}>
          <Grid>
            <Typography variant="h3">{clusterLabel}</Typography>
          </Grid>
          <Grid>
            <button
              onClick={() =>
                downloadFile(`${clusterLabel}-kubeconfig.yaml`, data ?? '')
              }
              className={classes.iconLink}
              title="Download"
            >
              <Download className={classes.icon} />
            </button>
            <CopyTooltip className={classes.tooltip} text={data ?? ''} />
          </Grid>
        </Grid>
        <HighlightedMarkdown textOrMarkdown={'```\n' + data + '\n```'} />
      </DrawerContent>
    </Drawer>
  );
};
