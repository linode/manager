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
import { getKubeConfig } from 'src/services/kubernetes';
import { downloadFile } from 'src/utilities/downloadFile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

type ClassNames = 'root' | 'item' | 'button' | 'icon';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginBottom: theme.spacing(3),
      padding: `${theme.spacing(3) + 5}px ${theme.spacing(3) +
        1}px ${theme.spacing(2) - 3}px`
    },
    item: {
      paddingBottom: theme.spacing(2)
    },
    button: {
      marginRight: theme.spacing(3)
    },
    icon: {
      marginLeft: theme.spacing(2)
    }
  });

interface Props {
  clusterID: number;
}

export type CombinedProps = Props & WithStyles<ClassNames> & WithSnackbarProps;

const downloadKubeConfig = (clusterID: number, enqueueSnackbar: any) => {
  /**
   * This is reused from ClusterActionMenu, but there wasn't an easy way
   * to share logic (more than is already abstracted in the downloadFile utility).
   * @todo figure out a better way to keep it DRY
   */
  getKubeConfig(clusterID)
    .then(response => {
      // Convert to utf-8 from base64
      try {
        const decodedFile = window.atob(response.kubeconfig);
        downloadFile('kubeconfig.yaml', decodedFile);
      } catch (e) {
        reportException(e, {
          'Encoded response': response.kubeconfig
        });
        enqueueSnackbar('Error parsing your kubeconfig file', {
          variant: 'error'
        });
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

export const KubeConfigPanel: React.FC<CombinedProps> = props => {
  const { classes, clusterID, enqueueSnackbar } = props;
  return (
    <Paper className={classes.root}>
      <Paper className={classes.item}>
        <Typography variant="h2">Kubeconfig</Typography>
      </Paper>
      <Paper className={classes.item}>
        <Button
          className={classes.button}
          buttonType="primary"
          onClick={() => downloadKubeConfig(clusterID, enqueueSnackbar)}
        >
          Download
          <Download className={classes.icon} />
        </Button>
        <Button
          className={classes.button}
          buttonType="secondary"
          onClick={() => null}
        >
          View
          <View className={classes.icon} />
        </Button>
      </Paper>
    </Paper>
  );
};

const styled = withStyles(styles);
const enhanced = compose<CombinedProps, Props>(
  styled,
  withSnackbar
)(KubeConfigPanel);

export default enhanced;
