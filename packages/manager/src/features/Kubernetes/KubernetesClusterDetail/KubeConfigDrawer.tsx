import * as React from 'react';
import Download from 'src/assets/icons/download.svg';
import CopyTooltip from 'src/components/CopyTooltip';
import Grid from 'src/components/core/Grid';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import DrawerContent from 'src/components/DrawerContent';
import { downloadFile } from 'src/utilities/downloadFile';
import HighlightedMarkdown from 'src/components/HighlightedMarkdown';
import { useKubenetesKubeConfigQuery } from 'src/queries/kubernetes';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    color: '#3683dc',
  },
  tooltip: {
    '& svg': {
      color: '#3683dc',
    },
  },
  iconLink: {
    marginRight: theme.spacing(1),
    background: 'none',
    border: 'none',
    padding: 0,
    font: 'inherit',
    cursor: 'pointer',
  },
}));

interface Props {
  clusterId: number;
  clusterLabel: string;
  open: boolean;
  closeDrawer: () => void;
}

export const KubeConfigDrawer = (props: Props) => {
  const classes = useStyles();
  const { clusterLabel, clusterId, closeDrawer, open } = props;

  const {
    data,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useKubenetesKubeConfigQuery(clusterId, open);

  // refetchOnMount isnt good enough for this query because
  // it is already mounted in the rendered Drawer
  React.useEffect(() => {
    if (open && !isLoading && !isFetching) {
      refetch();
    }
  }, [open]);

  return (
    <Drawer title={'View Kubeconfig'} open={open} onClose={closeDrawer} wide>
      <DrawerContent
        title={clusterLabel}
        error={!!error}
        errorMessage={error?.[0].reason}
        loading={isLoading}
      >
        <Grid container spacing={2}>
          <Grid item>
            <Typography variant="h3">{clusterLabel}</Typography>
          </Grid>
          <Grid item>
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
