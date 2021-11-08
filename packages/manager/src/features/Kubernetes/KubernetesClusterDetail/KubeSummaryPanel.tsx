import {
  getKubeConfig,
  KubernetesCluster,
} from '@linode/api-v4/lib/kubernetes';
import { APIError } from '@linode/api-v4/lib/types';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import classNames from 'classnames';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import DetailsIcon from 'src/assets/icons/code-file.svg';
import DownloadIcon from 'src/assets/icons/lke-download.svg';
import ResetIcon from 'src/assets/icons/reset.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Chip from 'src/components/core/Chip';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme, useMediaQuery } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TagsPanel from 'src/components/TagsPanel';
import { dcDisplayNames } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import { ExtendedCluster } from 'src/features/Kubernetes/types';
import { useDialog } from 'src/hooks/useDialog';
import { useResetKubeConfigMutation } from 'src/queries/kubernetesConfig';
import useKubernetesDashboardQuery from 'src/queries/kubernetesDashboard';
import { deleteCluster } from 'src/store/kubernetes/kubernetes.requests';
import { ThunkDispatch } from 'src/store/types';
import { downloadFile } from 'src/utilities/downloadFile';
import {
  getAPIErrorOrDefault,
  getErrorStringOrDefault,
} from 'src/utilities/errorUtils';
import { pluralize } from 'src/utilities/pluralize';
import { getTotalClusterPrice } from '../kubeUtils';
import KubeConfigDrawer from './KubeConfigDrawer';
import KubernetesDialog from './KubernetesDialog';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    padding: `${theme.spacing(2) + 4}px ${
      theme.spacing(2) + 4
    }px ${theme.spacing(3)}px`,
  },
  mainGridContainer: {
    position: 'relative',
    [theme.breakpoints.up('lg')]: {
      justifyContent: 'space-between',
    },
  },
  item: {
    '&:last-of-type': {
      paddingBottom: 0,
    },
    paddingBottom: theme.spacing(1),
  },
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
    color: theme.cmrTextColors.linkActiveLight,
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
  iconTextOuter: {
    flexBasis: '72%',
    minWidth: 115,
  },
  tags: {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    '&.MuiGrid-item': {
      paddingBottom: 0,
    },
    // Tags Panel wrapper
    '& > div:last-child': {
      marginTop: 2,
      marginBottom: 0,
      width: '100%',
    },
    [theme.breakpoints.up('lg')]: {
      '& .MuiChip-root': {
        marginRight: 0,
        marginLeft: 4,
      },
      // Add a Tag button
      '& > div:first-child': {
        justifyContent: 'flex-end',
        marginTop: theme.spacing(5),
      },
      // Tags Panel wrapper
      '& > div:last-child': {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
      },
    },
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  dashboard: {
    '& svg': {
      height: 14,
      marginLeft: 4,
    },
  },
  buttons: {
    marginRight: theme.spacing(),
  },
  chip: {
    backgroundColor: theme.color.tagButton,
    borderRadius: 1,
    fontSize: 10,
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  },
  actionRow: {
    flexDirection: 'column',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-end',
      flexDirection: 'row',
    },
  },
}));

interface Props {
  cluster: ExtendedCluster;
  endpoint: string | null;
  endpointError?: string;
  endpointLoading: boolean;
  kubeconfigAvailable: boolean;
  kubeconfigError?: string;
  handleUpdateTags: (updatedTags: string[]) => Promise<KubernetesCluster>;
  isClusterHighlyAvailable: boolean;
  isKubeDashboardFeatureEnabled: boolean;
}

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

export const KubeSummaryPanel: React.FunctionComponent<Props> = (props) => {
  const {
    cluster,
    endpoint,
    endpointError,
    endpointLoading,
    kubeconfigAvailable,
    kubeconfigError,
    handleUpdateTags,
    isClusterHighlyAvailable,
    isKubeDashboardFeatureEnabled,
  } = props;
  const classes = useStyles();
  const { push } = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const [drawerError, setDrawerError] = React.useState<string | null>(null);
  const [drawerLoading, setDrawerLoading] = React.useState<boolean>(false);
  const region = dcDisplayNames[cluster.region] || 'Unknown region';
  const matches = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const {
    data: dashboard,
    error: dashboardError,
  } = useKubernetesDashboardQuery(cluster.id, isKubeDashboardFeatureEnabled);

  const {
    mutateAsync: resetKubeConfig,
    isLoading: isResettingKubeConfig,
    error: resetKubeConfigError,
  } = useResetKubeConfigMutation();

  // Deletion handlers
  // NB: this is using dispatch directly because I don't want to
  // add re-render issues to our useKubernetesClusters hook, especially
  // since we're going to switch to queries for all of these soon.
  const dispatch: ThunkDispatch = useDispatch();
  const _deleteCluster = () =>
    dispatch(deleteCluster({ clusterID: cluster.id })).then(() =>
      push('/kubernetes/clusters')
    );

  const { dialog, closeDialog, openDialog, submitDialog } = useDialog(
    _deleteCluster
  );

  const [
    resetKubeConfigDialogOpen,
    setResetKubeConfigDialogOpen,
  ] = React.useState(false);

  const [kubeConfig, setKubeConfig] = React.useState<string>('');

  const fetchKubeConfig = () => {
    return getKubeConfig(cluster.id).then((response) => {
      // Convert to utf-8 from base64
      try {
        return window.atob(response.kubeconfig);
      } catch (e) {
        reportException(e, {
          'Encoded response': response.kubeconfig,
        });
        enqueueSnackbar('Error parsing your kubeconfig file', {
          variant: 'error',
        });
        return;
      }
    });
  };

  const downloadKubeConfig = () => {
    fetchKubeConfig()
      .then((decodedFile) => {
        if (decodedFile) {
          downloadFile(`${cluster.label}-kubeconfig.yaml`, decodedFile);
        } else {
          // There was a parsing error, the user will see an error toast.
          return;
        }
      })
      .catch((errorResponse) => {
        const error = getAPIErrorOrDefault(
          errorResponse,
          'Unable to download your kubeconfig'
        )[0].reason;
        enqueueSnackbar(error, { variant: 'error' });
      });
  };

  const handleResetKubeConfig = () => {
    return resetKubeConfig({ id: cluster.id }).then(() => {
      setResetKubeConfigDialogOpen(false);
      enqueueSnackbar('Successfully reset Kubeconfig', {
        variant: 'success',
      });
    });
  };

  const handleOpenDrawer = () => {
    setDrawerError(null);
    setDrawerLoading(true);
    setDrawerOpen(true);
    fetchKubeConfig()
      .then((decodedFile) => {
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
        justifyContent="space-between"
        xs={12}
        lg={5}
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
                  {`${cluster.label}-kubeconfig.yaml`}
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
          <Grid item container direction="row" xs={12} lg={3}>
            <Grid item lg={6}>
              <Grid
                container
                item
                wrap="nowrap"
                alignItems="center"
                className={classes.item}
              >
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
                <Grid item className={classes.iconTextOuter}>
                  <Typography>
                    {`$${getTotalClusterPrice(
                      cluster.node_pools,
                      isClusterHighlyAvailable
                    ).toFixed(2)}/month`}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid item lg={6}>
              <Grid
                container
                item
                wrap="nowrap"
                alignItems="center"
                className={classes.item}
              >
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
                <Grid item className={classes.iconTextOuter}>
                  <Typography>
                    {Math.floor(cluster.totalStorage / 1024)} GB Storage
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid
            item
            container
            direction="row"
            lg={9}
            justifyContent="space-between"
          >
            {setKubeconfigDisplay()}
            <Grid
              item
              container
              direction="row"
              xs={12}
              lg={7}
              justifyContent="flex-end"
            >
              <Grid
                item
                container
                lg={12}
                alignContent="flex-end"
                style={matches ? { margin: 1 } : undefined}
              >
                <Grid
                  item
                  container
                  direction={matches ? 'row-reverse' : 'row'}
                  justifyContent={matches ? 'flex-start' : 'flex-end'}
                >
                  {isClusterHighlyAvailable ? (
                    <Grid item>
                      <Chip className={classes.chip} label="HA CLUSTER" />
                    </Grid>
                  ) : null}
                  {isKubeDashboardFeatureEnabled ? (
                    <Button
                      className={`${classes.dashboard} ${classes.buttons}`}
                      buttonType="secondary"
                      disabled={Boolean(dashboardError)}
                      onClick={() => {
                        window.open(dashboard?.endpoint, '_blank');
                      }}
                    >
                      Kubernetes Dashboard
                      <OpenInNewIcon />
                    </Button>
                  ) : null}
                  <Button
                    className={classes.buttons}
                    buttonType="secondary"
                    onClick={() => openDialog(cluster.id)}
                  >
                    Delete Cluster
                  </Button>
                </Grid>
              </Grid>
              <Grid item className={classes.tags} xs={12} lg={12}>
                <TagsPanel
                  align="right"
                  tags={cluster.tags}
                  updateTags={handleUpdateTags}
                />
              </Grid>
            </Grid>
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
      <KubernetesDialog
        open={dialog.isOpen}
        loading={dialog.isLoading}
        error={dialog.error}
        clusterLabel={cluster.label}
        clusterPools={cluster.node_pools}
        onClose={closeDialog}
        onDelete={() => submitDialog(cluster.id)}
      />
      <ConfirmationDialog
        open={resetKubeConfigDialogOpen}
        onClose={() => setResetKubeConfigDialogOpen(false)}
        title="Reset Cluster Kubeconfig?"
        actions={
          <ActionsPanel>
            <Button
              buttonType="secondary"
              onClick={() => setResetKubeConfigDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              buttonType="primary"
              onClick={() => handleResetKubeConfig()}
              loading={isResettingKubeConfig}
            >
              Reset Kubeconfig
            </Button>
          </ActionsPanel>
        }
        error={
          resetKubeConfigError && resetKubeConfigError.length > 0
            ? getErrorStringOrDefault(
                resetKubeConfigError,
                'Unable to reset Kubeconfig'
              )
            : undefined
        }
      >
        This will delete and regenerate the cluster&apos;s Kubeconfig file. You
        will no longer be able to access this cluster via your previous
        Kubeconfig file. This action cannot be undone.
      </ConfirmationDialog>
    </React.Fragment>
  );
};

export default React.memo(KubeSummaryPanel);
