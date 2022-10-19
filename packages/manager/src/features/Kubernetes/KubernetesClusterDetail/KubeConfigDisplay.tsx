import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import DetailsIcon from 'src/assets/icons/code-file.svg';
import DownloadIcon from 'src/assets/icons/lke-download.svg';
import ResetIcon from 'src/assets/icons/reset.svg';
import classNames from 'classnames';

interface Props {
  clusterLabel: string;
  endpoint: string | null;
  endpointError?: string;
  endpointLoading: boolean;
  kubeconfigAvailable: boolean;
  kubeconfigError?: string;
  isResettingKubeConfig: boolean;
  downloadKubeConfig: () => void;
  handleOpenDrawer: () => void;
  setResetKubeConfigDialogOpen: (open: boolean) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  label: {
    fontWeight: 'bold',
    marginBottom: `${theme.spacing(1) - 3}px`,
  },
  kubeconfigElements: {
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.primary.main,
  },
  kubeconfigElement: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    borderRight: '1px solid #c4c4c4',
    '&:hover': {
      opacity: 0.7,
    },
    '&:last-child': {
      borderRight: 'none',
    },
  },
  kubeconfigFileText: {
    color: theme.textColors.linkActiveLight,
    marginRight: theme.spacing(1),
    whiteSpace: 'nowrap',
  },
  kubeconfigIcons: {
    height: 16,
    width: 16,
    margin: `0 ${theme.spacing(1)}px`,
    objectFit: 'contain',
  },
  disabled: {
    color: theme.palette.text.secondary,
    pointer: 'default',
    pointerEvents: 'none',
    '& g': {
      stroke: theme.palette.text.secondary,
    },
  },
}));

const renderEndpoint = (
  endpoint: string | null,
  endpointLoading: boolean,
  endpointError?: string
) => {
  if (endpoint) {
    return endpoint;
  }
  if (endpointLoading) {
    return 'Loading...';
  }
  if (endpointError) {
    return endpointError;
  }
  return 'Your endpoint will be displayed here once it is available.';
};

export const KubeConfigDisplay: React.FC<Props> = (props) => {
  const {
    clusterLabel,
    endpoint,
    endpointError,
    endpointLoading,
    kubeconfigAvailable,
    kubeconfigError,
    isResettingKubeConfig,
    downloadKubeConfig,
    handleOpenDrawer,
    setResetKubeConfigDialogOpen,
  } = props;
  const classes = useStyles();

  return (
    <>
      <Grid item>
        <Typography className={classes.label}>
          Kubernetes API Endpoint:
        </Typography>
        <Typography>
          {renderEndpoint(endpoint, endpointLoading, endpointError)}
        </Typography>
      </Grid>
      <Grid item>
        <Typography className={classes.label} style={{ marginTop: 8 }}>
          Kubeconfig:
        </Typography>
        {kubeconfigAvailable ? (
          <div className={classes.kubeconfigElements}>
            <Grid
              item
              onClick={downloadKubeConfig}
              className={classes.kubeconfigElement}
            >
              <DownloadIcon
                className={classes.kubeconfigIcons}
                style={{ marginLeft: 0 }}
              />
              <Typography className={classes.kubeconfigFileText}>
                {`${clusterLabel}-kubeconfig.yaml`}
              </Typography>
            </Grid>
            <Grid
              item
              onClick={handleOpenDrawer}
              className={classes.kubeconfigElement}
            >
              <DetailsIcon className={classes.kubeconfigIcons} />
              <Typography className={classes.kubeconfigFileText}>
                View
              </Typography>
            </Grid>
            <Grid
              item
              onClick={() => setResetKubeConfigDialogOpen(true)}
              className={classes.kubeconfigElement}
            >
              <ResetIcon
                className={classNames({
                  [classes.kubeconfigIcons]: true,
                  [classes.disabled]: isResettingKubeConfig,
                })}
              />
              <Typography
                className={classNames({
                  [classes.kubeconfigFileText]: true,
                  [classes.disabled]: isResettingKubeConfig,
                })}
              >
                Reset
              </Typography>
            </Grid>
          </div>
        ) : (
          <Typography>
            {kubeconfigError ??
              'Your Kubeconfig will be viewable here once it is available.'}
          </Typography>
        )}
      </Grid>
    </>
  );
};

export default KubeConfigDisplay;
