import { Button, Paper, Typography } from '@linode/ui';
import { downloadFile } from '@linode/utilities';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import Download from 'src/assets/icons/download.svg';
import View from 'src/assets/icons/view.svg';
import { useKubernetesKubeConfigQuery } from 'src/queries/kubernetes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { KubeConfigDrawer } from './KubeConfigDrawer';

import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  button: {
    display: 'block',
    fontSize: '0.9rem',
    marginRight: 12,
    minWidth: 124,
    padding: `calc(${theme.spacing(2)} - 2px)`,
    [theme.breakpoints.down('xl')]: {
      marginBottom: theme.spacing(2),
      marginRight: 0,
    },
  },
  buttonSecondary: {
    minWidth: 88,
    [theme.breakpoints.down('xl')]: {
      marginBottom: 0,
      marginRight: 0,
    },
  },
  icon: {
    marginLeft: `calc(${theme.spacing(1)} + 3px)`,
  },
  item: {
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.up('xl')]: {
      display: 'flex',
      flexFlow: 'row nowrap',
    },
  },
  root: {
    padding: `calc(${theme.spacing(3)} + 5px) calc(${theme.spacing(
      3
    )} + 1px) calc(${theme.spacing(2)} - 3px)`,
    [theme.breakpoints.up('md')]: {
      marginTop: 66,
    },
  },
}));

interface Props {
  clusterID: number;
  clusterLabel: string;
}

export const KubeConfigPanel = (props: Props) => {
  const { clusterID, clusterLabel } = props;
  const { classes, cx } = useStyles();
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const { refetch } = useKubernetesKubeConfigQuery(clusterID);
  const { enqueueSnackbar } = useSnackbar();

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };

  const downloadKubeConfig = async () => {
    try {
      const { data } = await refetch();

      if (data) {
        downloadFile(`${clusterLabel}-kubeconfig.yaml`, data);
      }
    } catch (error) {
      const errorText = getAPIErrorOrDefault(
        error,
        'Unable to download your kubeconfig'
      )[0].reason;

      enqueueSnackbar(errorText, { variant: 'error' });
    }
  };

  return (
    <>
      <Paper className={classes.root}>
        <Paper className={classes.item}>
          <Typography variant="h2">Kubeconfig</Typography>
        </Paper>
        <Paper className={classes.item}>
          <Button
            buttonType="primary"
            className={classes.button}
            onClick={downloadKubeConfig}
          >
            Download
            <Download className={classes.icon} />
          </Button>
          <Button
            buttonType="secondary"
            className={cx(classes.button, classes.buttonSecondary)}
            onClick={handleOpenDrawer}
          >
            View
            <View className={classes.icon} />
          </Button>
        </Paper>
      </Paper>
      <KubeConfigDrawer
        closeDrawer={() => setDrawerOpen(false)}
        clusterId={clusterID}
        clusterLabel={clusterLabel}
        open={drawerOpen}
      />
    </>
  );
};
