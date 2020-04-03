import { getKubeConfig } from 'linode-js-sdk/lib/kubernetes';
import { APIError } from 'linode-js-sdk/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';

import DetailsIcon from 'src/assets/icons/details.svg';
import DownloadIcon from 'src/assets/icons/download.svg';
import CPUIcon from 'src/assets/icons/longview/cpu-icon.svg';
import DiskIcon from 'src/assets/icons/longview/disk.svg';
import RamIcon from 'src/assets/icons/longview/ram-sticks.svg';
import MapPin from 'src/assets/icons/map-pin-icon.svg';
import MiniKube from 'src/assets/icons/mini-kube.svg';
import PriceIcon from 'src/assets/icons/price-icon.svg';

import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
// import TagsPanel from 'src/components/TagsPanel'; // Temporarily commented out because Tags functionality for clusters is not in place yet.
import { dcDisplayNames } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import { ExtendedCluster } from 'src/features/Kubernetes/types';
import { downloadFile } from 'src/utilities/downloadFile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getTotalClusterPrice } from '../kubeUtils';

import KubeConfigDrawer from './KubeConfigDrawer';

type ClassNames =
  | 'root'
  | 'item'
  | 'label'
  | 'column'
  | 'linksGrid'
  | 'iconsSharedStyling'
  | 'kubeconfigElements'
  | 'kubeconfigFileText'
  | 'kubeconfigIcons';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginBottom: theme.spacing(3),
      padding: `${theme.spacing(3) + 5}px ${theme.spacing(3) +
        1}px ${theme.spacing(2) - 3}px`
    },
    item: {
      '&:last-of-type': {
        marginBottom: 0
      },
      paddingBottom: theme.spacing(1)
    },
    label: {
      color: theme.color.kubeLabel,
      marginBottom: theme.spacing(1),
      fontWeight: 'bold'
    },
    column: {
      marginRight: theme.spacing(3)
    },
    linksGrid: {
      width: '30%',
      marginRight: theme.spacing(2)
    },
    iconsSharedStyling: {
      width: 24,
      height: 24,
      objectFit: 'contain'
    },
    kubeconfigElements: {
      color: theme.palette.primary.main,
      display: 'flex',
      alignItems: 'center'
    },
    kubeconfigFileText: {
      cursor: 'pointer',
      color: theme.palette.primary.main
    },
    kubeconfigIcons: {
      cursor: 'pointer',
      width: 16,
      height: 16,
      objectFit: 'contain',
      margin: `0 ${theme.spacing(1)}px`
    }
  });

interface Props {
  cluster: ExtendedCluster;
  endpoint: string | null;
  endpointError?: string;
  endpointLoading: boolean;
  kubeconfigAvailable: boolean;
  kubeconfigError?: string;
}

type CombinedProps = Props & WithStyles<ClassNames> & WithSnackbarProps;

const renderEndpoint = (
  endpoint: string | null,
  endpointLoading: boolean,
  endpointError?: string
) => {
  if (endpoint) {
    return endpoint;
  } else if (endpointLoading) {
    return 'Loading...';
  } else if (endpointError) {
    return endpointError;
  } else {
    return 'Your endpoint will be displayed here once it is available.';
  }
};

export const KubeSummaryPanel: React.FunctionComponent<CombinedProps> = props => {
  const {
    classes,
    cluster,
    endpoint,
    endpointError,
    endpointLoading,
    enqueueSnackbar,
    kubeconfigAvailable,
    kubeconfigError
  } = props;
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const [drawerError, setDrawerError] = React.useState<string | null>(null);
  const [drawerLoading, setDrawerLoading] = React.useState<boolean>(false);
  const region = dcDisplayNames[cluster.region] || 'Unknown region';

  const [kubeConfig, setKubeConfig] = React.useState<string>('');

  const fetchKubeConfig = () => {
    return getKubeConfig(cluster.id).then(response => {
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

  const downloadKubeConfig = () => {
    fetchKubeConfig()
      .then(decodedFile => {
        if (decodedFile) {
          downloadFile(`${cluster.label}-kubeconfig.yaml`, decodedFile);
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

  const handleOpenDrawer = () => {
    setDrawerError(null);
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
      .catch((error: APIError[]) => {
        setDrawerError(error[0]?.reason || null);
        setDrawerLoading(false);
      });
  };

  // The function below is a placeholder that will need to be edited once cluster Tags functionality is in place.
  /* const updateTags = async (tags: string[]) => {
    const { cluster.id, clusterActions } = props;

    // Send the request (which updates the internal store.)
    await clusterActions.updateCluster({ cluster.id, tags });
  }; */

  const setKubeconfigDisplay = () => {
    return (
      <Grid item className={classes.linksGrid} xs={12} md={4}>
        <Paper className={classes.item}>
          <Typography className={classes.label}>
            Kubernetes API Endpoint:
          </Typography>
          <Typography>
            {renderEndpoint(endpoint, endpointLoading, endpointError)}
          </Typography>
        </Paper>

        <Paper className={classes.item}>
          <Typography className={classes.label}>Kubeconfig:</Typography>

          {kubeconfigAvailable ? (
            <div className={classes.kubeconfigElements}>
              <Typography
                className={classes.kubeconfigFileText}
                onClick={downloadKubeConfig}
              >
                {`${cluster.label}-kubeconfig.yaml`}
              </Typography>

              <div>
                <DownloadIcon
                  className={classes.kubeconfigIcons}
                  onClick={downloadKubeConfig}
                />
                <DetailsIcon
                  className={classes.kubeconfigIcons}
                  onClick={handleOpenDrawer}
                />
              </div>
            </div>
          ) : (
            <Typography>
              {kubeconfigError ??
                'Your Kubeconfig will be viewable here once it is available.'}
            </Typography>
          )}
        </Paper>
      </Grid>
    );
  };

  return (
    <React.Fragment>
      <Paper className={classes.root}>
        <Grid container>
          <Grid item className={classes.column}>
            <Grid
              container
              item
              wrap="nowrap"
              alignItems="center"
              className={classes.item}
            >
              <Grid item>
                <MiniKube className={classes.iconsSharedStyling} />
              </Grid>

              <Grid item>
                <Typography>Version {cluster.version}</Typography>
              </Grid>
            </Grid>

            <Grid
              container
              item
              wrap="nowrap"
              alignItems="center"
              className={classes.item}
            >
              <Grid item>
                <MapPin className={classes.iconsSharedStyling} />
              </Grid>

              <Grid item>
                <Typography>{region}</Typography>
              </Grid>
            </Grid>

            <Grid
              container
              item
              wrap="nowrap"
              alignItems="center"
              className={classes.item}
            >
              <Grid item>
                <PriceIcon className={classes.iconsSharedStyling} />
              </Grid>

              <Grid item>
                <Typography>
                  {`$${getTotalClusterPrice(cluster.node_pools)}/month`}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item className={classes.column}>
            <Grid
              container
              item
              wrap="nowrap"
              alignItems="center"
              className={classes.item}
            >
              <Grid item>
                <CPUIcon className={classes.iconsSharedStyling} />
              </Grid>

              <Grid item>
                <Typography>{cluster.totalCPU} CPU Cores</Typography>
              </Grid>
            </Grid>

            <Grid
              container
              item
              wrap="nowrap"
              alignItems="center"
              className={classes.item}
            >
              <Grid item>
                <RamIcon className={classes.iconsSharedStyling} />
              </Grid>

              <Grid item>
                <Typography>{cluster.totalMemory / 1024} GB RAM</Typography>
              </Grid>
            </Grid>

            <Grid
              container
              item
              wrap="nowrap"
              alignItems="center"
              className={classes.item}
            >
              <Grid item>
                <DiskIcon width={19} height={24} object-fit="contain" />
              </Grid>

              <Grid item>
                <Typography>
                  {Math.floor(cluster.totalStorage / 1024)} GB Storage
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {setKubeconfigDisplay()}

          <Grid item>
            <Paper className={classes.item}>
              {/* <TagsPanel tags={['test']} updateTags={updateTags} /> */}
              {/* Will be done in a follow-up PR once Tags functionality is ready for clusters */}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <KubeConfigDrawer
        kubeConfig={kubeConfig}
        clusterLabel={cluster.label}
        open={drawerOpen}
        closeDrawer={() => setDrawerOpen(false)}
        error={drawerError}
        loading={drawerLoading}
      />
    </React.Fragment>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(
  React.memo,
  styled,
  withSnackbar
);

export default enhanced(KubeSummaryPanel);
