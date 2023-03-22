import { KubernetesCluster } from '@linode/api-v4/lib/kubernetes';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Chip from 'src/components/core/Chip';
import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import TagsPanel from 'src/components/TagsPanel';
import KubeClusterSpecs from 'src/features/Kubernetes/KubernetesClusterDetail/KubeClusterSpecs';
import useFlags from 'src/hooks/useFlags';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { KubeConfigDisplay } from './KubeConfigDisplay';
import { KubeConfigDrawer } from './KubeConfigDrawer';
import { DeleteKubernetesClusterDialog } from './DeleteKubernetesClusterDialog';
import {
  useKubernetesClusterMutation,
  useKubernetesDashboardQuery,
  useResetKubeConfigMutation,
} from 'src/queries/kubernetes';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    padding: `${theme.spacing(2.5)} ${theme.spacing(2.5)} ${theme.spacing(3)}`,
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
    [theme.breakpoints.down('lg')]: {
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
}

export const KubeSummaryPanel = (props: Props) => {
  const { cluster } = props;
  const classes = useStyles();
  const flags = useFlags();
  const { enqueueSnackbar } = useSnackbar();
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
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

  const handleResetKubeConfig = () => {
    return resetKubeConfig({ id: cluster.id }).then(() => {
      setResetKubeConfigDialogOpen(false);
      enqueueSnackbar('Successfully reset Kubeconfig', {
        variant: 'success',
      });
    });
  };

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
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
              clusterId={cluster.id}
              clusterLabel={cluster.label}
              isResettingKubeConfig={isResettingKubeConfig}
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
        clusterId={cluster.id}
        clusterLabel={cluster.label}
        open={drawerOpen}
        closeDrawer={() => setDrawerOpen(false)}
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
