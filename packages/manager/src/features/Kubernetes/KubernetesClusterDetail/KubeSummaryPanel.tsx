import { getKubeConfig, KubernetesCluster } from 'linode-js-sdk/lib/kubernetes';
import { APIError } from 'linode-js-sdk/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';

import DetailsIcon from 'src/assets/icons/code-file.svg';
import CPUIcon from 'src/assets/icons/cpu-icon.svg';
import DiskIcon from 'src/assets/icons/disk.svg';
import DownloadIcon from 'src/assets/icons/lke-download.svg';
import MapPin from 'src/assets/icons/map-pin-icon.svg';
import MiniKube from 'src/assets/icons/mini-kube.svg';
import PriceIcon from 'src/assets/icons/price-icon.svg';
import RamIcon from 'src/assets/icons/ram-sticks.svg';

import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TagsPanelRedesigned from 'src/components/TagsPanel/TagsPanelRedesigned';
import { dcDisplayNames } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import { ExtendedCluster } from 'src/features/Kubernetes/types';
import { downloadFile } from 'src/utilities/downloadFile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { pluralize } from 'src/utilities/pluralize';
import { getTotalClusterPrice } from '../kubeUtils';

import KubeConfigDrawer from './KubeConfigDrawer';

type ClassNames =
  | 'root'
  | 'item'
  | 'label'
  | 'column'
  | 'iconsSharedStyling'
  | 'kubeconfigSection'
  | 'kubeconfigElements'
  | 'kubeconfigFileText'
  | 'kubeconfigIcons'
  | 'tagsSection'
  | 'mainGridContainer'
  | 'iconSharedOuter'
  | 'iconTextOuter';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginBottom: theme.spacing(3),
      padding: `${theme.spacing(2) + 4}px ${theme.spacing(2) +
        4}px ${theme.spacing(3)}px`
    },
    mainGridContainer: {
      [theme.breakpoints.up('lg')]: {
        justifyContent: 'space-between'
      }
    },
    item: {
      '&:last-of-type': {
        paddingBottom: 0
      },
      paddingBottom: theme.spacing(1)
    },
    label: {
      marginBottom: `${theme.spacing(1) - 3}px`,
      fontWeight: 'bold'
    },
    column: {},
    iconsSharedStyling: {
      width: 24,
      height: 24,
      objectFit: 'contain'
    },
    kubeconfigSection: {
      marginTop: `${theme.spacing() + 2}px`
    },
    kubeconfigElements: {
      color: theme.palette.primary.main,
      display: 'flex',
      alignItems: 'center'
    },
    kubeconfigFileText: {
      cursor: 'pointer',
      color: theme.palette.primary.main,
      marginRight: theme.spacing(1)
    },
    kubeconfigIcons: {
      cursor: 'pointer',
      width: 16,
      height: 16,
      objectFit: 'contain',
      margin: `0 ${theme.spacing(1)}px`
    },
    tagsSection: {
      display: 'flex',
      [theme.breakpoints.up('lg')]: {
        justifyContent: 'flex-end',
        textAlign: 'right'
      }
    },
    iconSharedOuter: {
      textAlign: 'center',
      flexBasis: '28%'
    },
    iconTextOuter: {
      flexBasis: '72%',
      minWidth: 115
    }
  });

interface Props {
  cluster: ExtendedCluster;
  endpoint: string | null;
  endpointError?: string;
  endpointLoading: boolean;
  kubeconfigAvailable: boolean;
  kubeconfigError?: string;
  handleUpdateTags: (updatedTags: string[]) => Promise<KubernetesCluster>;
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
    kubeconfigError,
    handleUpdateTags
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
        return window.atob(response.kubeconfig);
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

  const setKubeconfigDisplay = () => {
    return (
      <Grid
        item
        container
        direction="column"
        justify="space-between"
        xs={12}
        lg={4}
      >
        <Grid item>
          <Typography className={classes.label}>
            Kubernetes API Endpoint:
          </Typography>
          <Typography>
            {renderEndpoint(endpoint, endpointLoading, endpointError)}
          </Typography>
        </Grid>

        <Grid item>
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
        </Grid>
      </Grid>
    );
  };

  return (
    <React.Fragment>
      <Paper className={classes.root}>
        <Grid
          container
          alignItems="flex-start"
          className={classes.mainGridContainer}
        >
          <Grid item container direction="row" xs={12} lg={4}>
            <Grid item className={classes.column}>
              <Grid
                container
                item
                wrap="nowrap"
                alignItems="center"
                className={classes.item}
              >
                <Grid item className={classes.iconSharedOuter}>
                  <MiniKube className={classes.iconsSharedStyling} />
                </Grid>

                <Grid item className={classes.iconTextOuter}>
                  <Typography>Version {cluster.k8s_version}</Typography>
                </Grid>
              </Grid>

              <Grid
                container
                item
                wrap="nowrap"
                alignItems="center"
                className={classes.item}
              >
                <Grid item className={classes.iconSharedOuter}>
                  <MapPin className={classes.iconsSharedStyling} />
                </Grid>

                <Grid item className={classes.iconTextOuter}>
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
                <Grid item className={classes.iconSharedOuter}>
                  <PriceIcon className={classes.iconsSharedStyling} />
                </Grid>

                <Grid item className={classes.iconTextOuter}>
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
                <Grid item className={classes.iconSharedOuter}>
                  <CPUIcon className={classes.iconsSharedStyling} />
                </Grid>

                <Grid item className={classes.iconTextOuter}>
                  <Typography>
                    {pluralize('CPU Core', 'CPU Cores', cluster.totalCPU)}
                  </Typography>
                </Grid>
              </Grid>

              <Grid
                container
                item
                wrap="nowrap"
                alignItems="center"
                className={classes.item}
              >
                <Grid item className={classes.iconSharedOuter}>
                  <RamIcon className={classes.iconsSharedStyling} />
                </Grid>

                <Grid item className={classes.iconTextOuter}>
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
                <Grid item className={classes.iconSharedOuter}>
                  <DiskIcon width={19} height={24} object-fit="contain" />
                </Grid>

                <Grid item className={classes.iconTextOuter}>
                  <Typography>
                    {Math.floor(cluster.totalStorage / 1024)} GB Storage
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {setKubeconfigDisplay()}

          <Grid item xs={12} lg={4}>
            <Paper className={classes.tagsSection}>
              <TagsPanelRedesigned
                tags={cluster.tags}
                updateTags={handleUpdateTags}
              />
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
