import { getKubeConfig } from 'linode-js-sdk/lib/kubernetes';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';

import Download from 'src/assets/icons/download.svg';
import View from 'src/assets/icons/view.svg';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { reportException } from 'src/exceptionReporting';
import { downloadFile } from 'src/utilities/downloadFile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import KubeConfigDrawer from './KubeConfigDrawer';

type ClassNames = 'root' | 'item' | 'button' | 'icon' | 'buttonSecondary';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: `${theme.spacing(3) + 5}px ${theme.spacing(3) +
        1}px ${theme.spacing(2) - 3}px`
    },
    item: {
      paddingBottom: theme.spacing(2),
      [theme.breakpoints.up('xl')]: {
        display: 'flex',
        flexFlow: 'row nowrap'
      }
    },
    button: {
      padding: theme.spacing(2) - 2,
      display: 'block',
      fontSize: '0.9rem',
      marginRight: 12,
      minWidth: 124,
      [theme.breakpoints.down('lg')]: {
        marginBottom: theme.spacing(2),
        marginRight: 0
      }
    },
    buttonSecondary: {
      minWidth: 88,
      [theme.breakpoints.down('lg')]: {
        marginBottom: 0,
        marginRight: 0
      }
    },
    icon: {
      marginLeft: theme.spacing(1) + 3
    }
  });

interface Props {
  clusterID: number;
  clusterLabel: string;
}

export type CombinedProps = Props & WithStyles<ClassNames> & WithSnackbarProps;

export const KubeConfigPanel: React.FC<CombinedProps> = props => {
  const { classes, clusterID, clusterLabel, enqueueSnackbar } = props;
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const [drawerError, setDrawerError] = React.useState<boolean>(false);
  const [drawerLoading, setDrawerLoading] = React.useState<boolean>(false);
  const [kubeConfig, setKubeConfig] = React.useState<string>('');

  const fetchKubeConfig = () => {
    return getKubeConfig(clusterID).then(response => {
      // Convert to utf-8 from base64
      try {
        const decodedFile = window.atob(response.kubeconfig);
        return decodedFile;
      } catch (e) {
        reportException(e, {
          'Encoded response': response.kubeconfig
        });
        enqueueSnackbar('Error parsing your kubeconfig file', {
          variant: 'error'
        });
        return;
      }
    });
  };

  const handleOpenDrawer = () => {
    setDrawerError(false);
    setDrawerLoading(true);
    setDrawerOpen(true);
    fetchKubeConfig()
      .then(decodedFile => {
        setDrawerLoading(false);
        if (decodedFile) {
          setKubeConfig(decodedFile);
        } else {
          // There was a parsing error; the user will see an error toast.
        }
      })
      .catch(_ => {
        setDrawerError(true);
        setDrawerLoading(false);
      });
  };

  const downloadKubeConfig = () => {
    fetchKubeConfig()
      .then(decodedFile => {
        if (decodedFile) {
          downloadFile(`${clusterLabel}-kubeconfig.yaml`, decodedFile);
        } else {
          // There was a parsing error, the user will see an error toast.
          return;
        }
      })
      .catch(errorResponse => {
        const error = getAPIErrorOrDefault(
          errorResponse,
          'Unable to download your kubeconfig'
        )[0].reason;
        enqueueSnackbar(error, { variant: 'error' });
      });
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
            className={`${classes.button} ${classes.buttonSecondary}`}
            buttonType="secondary"
            onClick={handleOpenDrawer}
          >
            View
            <View className={classes.icon} />
          </Button>
        </Paper>
      </Paper>
      <KubeConfigDrawer
        clusterLabel={clusterLabel}
        open={drawerOpen}
        loading={drawerLoading}
        error={drawerError}
        closeDrawer={() => setDrawerOpen(false)}
        kubeConfig={kubeConfig}
      />
    </>
  );
};

const styled = withStyles(styles);
const enhanced = compose<CombinedProps, Props>(
  styled,
  withSnackbar
)(KubeConfigPanel);

export default enhanced;
