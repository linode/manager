import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { StyledActionButton } from 'src/components/Button/StyledActionButton';
import { Chip } from 'src/components/Chip';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { EntityDetail } from 'src/components/EntityDetail/EntityDetail';
import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { Stack } from 'src/components/Stack';
import { TagCell } from 'src/components/TagCell/TagCell';
import { Typography } from 'src/components/Typography';
import { KubeClusterSpecs } from 'src/features/Kubernetes/KubernetesClusterDetail/KubeClusterSpecs';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import {
  useKubernetesClusterMutation,
  useKubernetesDashboardQuery,
  useResetKubeConfigMutation,
} from 'src/queries/kubernetes';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { DeleteKubernetesClusterDialog } from './DeleteKubernetesClusterDialog';
import { KubeConfigDisplay } from './KubeConfigDisplay';
import { KubeConfigDrawer } from './KubeConfigDrawer';

import type { KubernetesCluster } from '@linode/api-v4/lib/kubernetes';
import type { Theme } from '@mui/material/styles';

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
    alignItems: 'center',
    display: 'flex',
  },
  deleteClusterBtn: {
    [theme.breakpoints.up('md')]: {
      paddingRight: '8px',
    },
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
        justifyContent: 'flex-end',
      },
    },
    width: '100%',
  },
}));

interface Props {
  cluster: KubernetesCluster;
}

export const KubeSummaryPanel = React.memo((props: Props) => {
  const { cluster } = props;

  const { classes } = useStyles();
  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();

  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const { mutateAsync: updateKubernetesCluster } = useKubernetesClusterMutation(
    cluster.id
  );

  const {
    data: dashboard,
    error: dashboardError,
  } = useKubernetesDashboardQuery(cluster.id);

  const {
    error: resetKubeConfigError,
    isPending: isResettingKubeConfig,
    mutateAsync: resetKubeConfig,
  } = useResetKubeConfigMutation();

  const isClusterReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'linode',
    id: cluster.id,
  });

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

  const sxSpacing = {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(1),
  };

  const sxMainGridContainer = {
    paddingBottom: theme.spacing(2.5),
    paddingTop: theme.spacing(2),
    position: 'relative',
  };

  return (
    <Stack sx={{ marginBottom: theme.spacing(3) }}>
      <EntityDetail
        body={
          <Grid
            container
            spacing={2}
            sx={{ ...sxSpacing, ...sxMainGridContainer }}
          >
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
                {cluster.control_plane.high_availability && (
                  <Chip
                    label="HA CLUSTER"
                    size="small"
                    sx={(theme) => ({ borderColor: theme.color.green })}
                    variant="outlined"
                  />
                )}
              </Grid>
              <Grid className={classes.tags}>
                <TagCell
                  disabled={isClusterReadOnly}
                  entityLabel={cluster.label}
                  tags={cluster.tags}
                  updateTags={handleUpdateTags}
                  view="inline"
                />
              </Grid>
            </Grid>
          </Grid>
        }
        header={
          <EntityHeader>
            <Box
              sx={{
                ...sxSpacing,
                paddingBottom: theme.spacing(),
                paddingTop: theme.spacing(),
              }}
            >
              <Typography variant="h2">Summary</Typography>
            </Box>
            <Box display="flex" justifyContent="end">
              <StyledActionButton
                onClick={() => {
                  window.open(dashboard?.url, '_blank');
                }}
                className={classes.dashboard}
                disabled={Boolean(dashboardError) || !dashboard}
              >
                Kubernetes Dashboard
                <OpenInNewIcon />
              </StyledActionButton>
              <StyledActionButton
                className={classes.deleteClusterBtn}
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete Cluster
              </StyledActionButton>
            </Box>
          </EntityHeader>
        }
        noBodyBottomBorder
      />

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
    </Stack>
  );
});
