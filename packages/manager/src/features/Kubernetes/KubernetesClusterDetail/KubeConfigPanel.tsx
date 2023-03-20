import classNames from 'classnames';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import Download from 'src/assets/icons/download.svg';
import View from 'src/assets/icons/view.svg';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import { useKubenetesKubeConfigQuery } from 'src/queries/kubernetes';
import { downloadFile } from 'src/utilities/downloadFile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { KubeConfigDrawer } from './KubeConfigDrawer';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: `calc(${theme.spacing(3)} + 5px) calc(${theme.spacing(
      3
    )} + 1px) calc(${theme.spacing(2)} - 3px)`,
    [theme.breakpoints.up('md')]: {
      marginTop: 66,
    },
  },
  item: {
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.up('xl')]: {
      display: 'flex',
      flexFlow: 'row nowrap',
    },
  },
  button: {
    padding: `calc(${theme.spacing(2)} - 2px)`,
    display: 'block',
    fontSize: '0.9rem',
    marginRight: 12,
    minWidth: 124,
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
}));

interface Props {
  clusterID: number;
  clusterLabel: string;
}

export const KubeConfigPanel = (props: Props) => {
  const { clusterID, clusterLabel } = props;
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const { refetch } = useKubenetesKubeConfigQuery(clusterID);
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
            className={classes.button}
            buttonType="primary"
            onClick={downloadKubeConfig}
          >
            Download
            <Download className={classes.icon} />
          </Button>
          <Button
            className={classNames(classes.button, classes.buttonSecondary)}
            buttonType="secondary"
            onClick={handleOpenDrawer}
          >
            View
            <View className={classes.icon} />
          </Button>
        </Paper>
      </Paper>
      <KubeConfigDrawer
        clusterId={clusterID}
        clusterLabel={clusterLabel}
        open={drawerOpen}
        closeDrawer={() => setDrawerOpen(false)}
      />
    </>
  );
};
