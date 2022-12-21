import {
  getKubeConfig,
  KubernetesCluster,
} from '@linode/api-v4/lib/kubernetes';
import { APIError } from '@linode/api-v4/lib/types';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Chip from 'src/components/core/Chip';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import TagsPanel from 'src/components/TagsPanel';
import { reportException } from 'src/exceptionReporting';
import KubeClusterSpecs from 'src/features/Kubernetes/KubernetesClusterDetail/KubeClusterSpecs';
import { useResetKubeConfigMutation } from 'src/queries/kubernetesConfig';
import useKubernetesDashboardQuery from 'src/queries/kubernetesDashboard';
import { downloadFile } from 'src/utilities/downloadFile';
import {
  getAPIErrorOrDefault,
  getErrorStringOrDefault,
} from 'src/utilities/errorUtils';
import KubeConfigDisplay from './KubeConfigDisplay';
import KubeConfigDrawer from './KubeConfigDrawer';
import { DeleteKubernetesClusterDialog } from './DeleteKubernetesClusterDialog';
import { useKubernetesClusterMutation } from 'src/queries/kubernetes';
import useFlags from 'src/hooks/useFlags';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    padding: `${theme.spacing(2) + 4}px ${
      theme.spacing(2) + 4
    }px ${theme.spacing(3)}px`,
  },
  mainGridContainer: {
    position: 'relative',
    justifyContent: 'space-between',
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
        marginTop: theme.spacing(4),
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
  actionRow: {
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    '& button': {
      alignItems: 'flex-start',
    },
  },
}));

interface Props {
  cluster: KubernetesCluster;
  endpoint: string | null;
  endpointError?: string;
  endpointLoading: boolean;
  kubeconfigAvailable: boolean;
  kubeconfigError?: string;
}

export const KubeSummaryPanel = (props: Props) => {
  const {
    cluster,
    endpoint,
    endpointError,
    endpointLoading,
    kubeconfigAvailable,
    kubeconfigError,
  } = props;
  const classes = useStyles();
  const flags = useFlags();
  const { enqueueSnackbar } = useSnackbar();
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const [drawerError, setDrawerError] = React.useState<string | null>(null);
  const [drawerLoading, setDrawerLoading] = React.useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const { mutateAsync: updateKubernetesCluster } = useKubernetesClusterMutation(
    cluster.id
  );

  const isKubeDashboardFeatureEnabled = Boolean(
    flags.kubernetesDashboardAvailability
  );

  const {
    data: dashboard,
    error: dashboardError,
  } = useKubernetesDashboardQuery(cluster.id, isKubeDashboardFeatureEnabled);

  const {
    mutateAsync: resetKubeConfig,
    isLoading: isResettingKubeConfig,
    error: resetKubeConfigError,
  } = useResetKubeConfigMutation();

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

  const handleUpdateTags = (newTags: string[]) => {
    return updateKubernetesCluster({
      tags: newTags,
    });
  };

  return (
    <>
      <Paper className={classes.root}>
        <Grid container className={classes.mainGridContainer}>
          <KubeClusterSpecs cluster={cluster} />
          <Grid
            item
            container
            direction="column"
            justifyContent="space-between"
            xs={12}
            lg={4}
          >
            <KubeConfigDisplay
              clusterLabel={cluster.label}
              endpoint={endpoint}
              endpointError={endpointError}
              endpointLoading={endpointLoading}
              kubeconfigAvailable={kubeconfigAvailable}
              kubeconfigError={kubeconfigError}
              isResettingKubeConfig={isResettingKubeConfig}
              downloadKubeConfig={downloadKubeConfig}
              handleOpenDrawer={handleOpenDrawer}
              setResetKubeConfigDialogOpen={setResetKubeConfigDialogOpen}
            />
          </Grid>
          <Grid
            item
            container
            xs={12}
            lg={5}
            justifyContent="flex-start"
            direction="column"
          >
            <Grid item className={classes.actionRow}>
              {cluster.control_plane.high_availability ? (
                <Chip
                  label="HA CLUSTER"
                  variant="outlined"
                  outlineColor="green"
                  size="small"
                />
              ) : null}
              {isKubeDashboardFeatureEnabled ? (
                <Button
                  className={classes.dashboard}
                  buttonType="secondary"
                  compactY
                  disabled={Boolean(dashboardError) || !dashboard}
                  onClick={() => {
                    window.open(dashboard?.url, '_blank');
                  }}
                >
                  Kubernetes Dashboard
                  <OpenInNewIcon />
                </Button>
              ) : null}
              <Button
                buttonType="secondary"
                compactY
                onClick={() => setIsDeleteDialogOpen(true)}
                style={{ paddingRight: 0 }}
              >
                Delete Cluster
              </Button>
            </Grid>
            <Grid item className={classes.tags}>
              <TagsPanel tags={cluster.tags} updateTags={handleUpdateTags} />
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
      <DeleteKubernetesClusterDialog
        open={isDeleteDialogOpen}
        clusterLabel={cluster.label}
        clusterId={cluster.id}
        onClose={() => setIsDeleteDialogOpen(false)}
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
        This will delete and regenerate the cluster&rsquo;s Kubeconfig file. You
        will no longer be able to access this cluster via your previous
        Kubeconfig file. This action cannot be undone.
      </ConfirmationDialog>
    </>
  );
};

export default React.memo(KubeSummaryPanel);
