import * as React from 'react';
import Download from 'src/assets/icons/download.svg';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import Grid from '@mui/material/Unstable_Grid2';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import DrawerContent from 'src/components/DrawerContent';
import { downloadFile } from 'src/utilities/downloadFile';
import { HighlightedMarkdown } from 'src/components/HighlightedMarkdown/HighlightedMarkdown';
import { useKubenetesKubeConfigQuery } from 'src/queries/kubernetes';

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
  clusterId: number;
  clusterLabel: string;
  open: boolean;
  closeDrawer: () => void;
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
    <Drawer title={'View Kubeconfig'} open={open} onClose={closeDrawer} wide>
      <DrawerContent
        title={clusterLabel}
        error={!!error}
        errorMessage={error?.[0].reason}
        loading={isLoading}
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
