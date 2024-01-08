import { KubernetesCluster } from '@linode/api-v4/lib/kubernetes';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { Chip } from 'src/components/Chip';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Paper } from 'src/components/Paper';
import { TagsPanel } from 'src/components/TagsPanel/TagsPanel';
import KubeClusterSpecs from 'src/features/Kubernetes/KubernetesClusterDetail/KubeClusterSpecs';
import { useFlags } from 'src/hooks/useFlags';
import {
  useKubernetesClusterMutation,
  useKubernetesDashboardQuery,
  useResetKubeConfigMutation,
} from 'src/queries/kubernetes';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { DeleteKubernetesClusterDialog } from './DeleteKubernetesClusterDialog';
import { KubeConfigDisplay } from './KubeConfigDisplay';
import { KubeConfigDrawer } from './KubeConfigDrawer';

const useStyles = makeStyles()((theme: Theme) => ({
  actionRow: {
    '& button': {
      alignItems: 'flex-start',
    },
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: '8px 0px',
  },
  dashboard: {
    '& svg': {
      height: 14,
      marginLeft: 4,
    },
  },
  deleteClusterBtn: {
    paddingRight: '0px',
    [theme.breakpoints.up('md')]: {
      paddingRight: '8px',
    },
  },
  mainGridContainer: {
    position: 'relative',
  },
  root: {
    marginBottom: theme.spacing(3),
    padding: `${theme.spacing(2.5)} ${theme.spacing(1)} ${theme.spacing(
      2.5
    )} ${theme.spacing(3)}`,
  },
  tags: {
    // Tags Panel wrapper
    '& > div:last-child': {
      marginBottom: 0,
      marginTop: 2,
      width: '100%',
    },
    '&.MuiGrid-item': {
      paddingBottom: 0,
    },
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('lg')]: {
      width: '100%',
    },
    [theme.breakpoints.up('lg')]: {
      '& .MuiChip-root': {
        marginLeft: 4,
        marginRight: 0,
      },
      // Add a Tag button
      '& > div:first-of-type': {
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
  },
}));

interface Props {
  cluster: KubernetesCluster;
}

export const KubeSummaryPanel = (props: Props) => {
  const { cluster } = props;
  const { classes } = useStyles();
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
    error: resetKubeConfigError,
    isLoading: isResettingKubeConfig,
    mutateAsync: resetKubeConfig,
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
        <Grid className={classes.mainGridContainer} container spacing={2}>
          <KubeClusterSpecs cluster={cluster} />
          <Grid container direction="column" lg={4} xs={12}>
            <KubeConfigDisplay
              clusterId={cluster.id}
              clusterLabel={cluster.label}
              handleOpenDrawer={handleOpenDrawer}
              isResettingKubeConfig={isResettingKubeConfig}
              setResetKubeConfigDialogOpen={setResetKubeConfigDialogOpen}
            />
          </Grid>
          <Grid
            container
            direction="column"
            justifyContent="space-between"
            lg={5}
            xs={12}
          >
            <Grid className={classes.actionRow}>
              {cluster.control_plane.high_availability ? (
                <Chip
                  label="HA CLUSTER"
                  outlineColor="green"
                  size="small"
                  variant="outlined"
                />
              ) : null}
              {isKubeDashboardFeatureEnabled ? (
                <Button
                  onClick={() => {
                    window.open(dashboard?.url, '_blank');
                  }}
                  buttonType="secondary"
                  className={classes.dashboard}
                  compactY
                  disabled={Boolean(dashboardError) || !dashboard}
                >
                  Kubernetes Dashboard
                  <OpenInNewIcon />
                </Button>
              ) : null}
              <Button
                buttonType="secondary"
                className={classes.deleteClusterBtn}
                compactY
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete Cluster
              </Button>
            </Grid>
            <Grid className={classes.tags}>
              <TagsPanel tags={cluster.tags} updateTags={handleUpdateTags} />
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <KubeConfigDrawer
        closeDrawer={() => setDrawerOpen(false)}
        clusterId={cluster.id}
        clusterLabel={cluster.label}
        open={drawerOpen}
      />
      <DeleteKubernetesClusterDialog
        clusterId={cluster.id}
        clusterLabel={cluster.label}
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
      />
      <ConfirmationDialog
        actions={
          <ActionsPanel
            primaryButtonProps={{
              label: 'Reset Kubeconfig',
              loading: isResettingKubeConfig,
              onClick: () => handleResetKubeConfig(),
            }}
            secondaryButtonProps={{
              label: 'Cancel',
              onClick: () => setResetKubeConfigDialogOpen(false),
            }}
          />
        }
        error={
          resetKubeConfigError && resetKubeConfigError.length > 0
            ? getErrorStringOrDefault(
                resetKubeConfigError,
                'Unable to reset Kubeconfig'
              )
            : undefined
        }
        onClose={() => setResetKubeConfigDialogOpen(false)}
        open={resetKubeConfigDialogOpen}
        title="Reset Cluster Kubeconfig?"
      >
        This will delete and regenerate the cluster&rsquo;s Kubeconfig file. You
        will no longer be able to access this cluster via your previous
        Kubeconfig file. This action cannot be undone.
      </ConfirmationDialog>
    </>
  );
};

export default React.memo(KubeSummaryPanel);
