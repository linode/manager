import { Box, Chip, Stack, StyledActionButton, Typography } from '@linode/ui';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { EntityDetail } from 'src/components/EntityDetail/EntityDetail';
import { EntityHeader } from 'src/components/EntityHeader/EntityHeader';
import { Hidden } from 'src/components/Hidden';
import { KubeClusterSpecs } from 'src/features/Kubernetes/KubernetesClusterDetail/KubeClusterSpecs';
import { getKubeControlPlaneACL } from 'src/features/Kubernetes/kubeUtils';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useAccount } from 'src/queries/account/account';
import {
  useKubernetesControlPlaneACLQuery,
  useKubernetesDashboardQuery,
  useResetKubeConfigMutation,
} from 'src/queries/kubernetes';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { DeleteKubernetesClusterDialog } from './DeleteKubernetesClusterDialog';
import { KubeConfigDisplay } from './KubeConfigDisplay';
import { KubeConfigDrawer } from './KubeConfigDrawer';
import { KubeControlPlaneACLDrawer } from './KubeControlPaneACLDrawer';
import { KubeEntityDetailFooter } from './KubeEntityDetailFooter';

import type { KubernetesCluster } from '@linode/api-v4/lib/kubernetes';

interface Props {
  cluster: KubernetesCluster;
}

export const KubeSummaryPanel = React.memo((props: Props) => {
  const { cluster } = props;

  const { data: account } = useAccount();
  const { showControlPlaneACL } = getKubeControlPlaneACL(account);

  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();

  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const [
    isControlPlaneACLDrawerOpen,
    setControlPlaneACLDrawerOpen,
  ] = React.useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

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

  const {
    data: aclData,
    error: isErrorKubernetesACL,
    isLoading: isLoadingKubernetesACL,
  } = useKubernetesControlPlaneACLQuery(cluster.id, !!showControlPlaneACL);

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

  return (
    <Box>
      <EntityDetail
        body={
          <Stack direction="row" flexWrap="wrap" gap={2} px={3} py={2}>
            <KubeClusterSpecs cluster={cluster} />
            <KubeConfigDisplay
              clusterId={cluster.id}
              clusterLabel={cluster.label}
              handleOpenDrawer={handleOpenDrawer}
              isResettingKubeConfig={isResettingKubeConfig}
              setResetKubeConfigDialogOpen={setResetKubeConfigDialogOpen}
            />
            {cluster.control_plane.high_availability && (
              <Chip
                sx={(theme) => ({
                  borderColor: theme.color.green,
                  position: 'absolute',
                  right: theme.spacing(3),
                })}
                label="HA CLUSTER"
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
        }
        footer={
          <KubeEntityDetailFooter
            aclData={aclData}
            clusterCreated={cluster.created}
            clusterId={cluster.id}
            clusterLabel={cluster.label}
            clusterTags={cluster.tags}
            clusterUpdated={cluster.updated}
            isClusterReadOnly={isClusterReadOnly}
            isLoadingKubernetesACL={isLoadingKubernetesACL}
            setControlPlaneACLDrawerOpen={setControlPlaneACLDrawerOpen}
            showControlPlaneACL={!!showControlPlaneACL}
          />
        }
        header={
          <EntityHeader>
            <Box
              sx={{
                paddingBottom: theme.spacing(),
                paddingLeft: theme.spacing(3),
                paddingRight: theme.spacing(1),
                paddingTop: theme.spacing(),
              }}
            >
              <Typography variant="h2">Summary</Typography>
            </Box>
            <Box>
              <Hidden smUp>
                <ActionMenu
                  actionsList={[
                    {
                      disabled: Boolean(dashboardError) || !dashboard,
                      onClick: () => window.open(dashboard?.url, '_blank'),
                      title: 'Kubernetes Dashboard',
                    },
                    {
                      onClick: () => setIsDeleteDialogOpen(true),
                      title: 'Delete Cluster',
                    },
                  ]}
                  ariaLabel={`Action menu for Kubernetes Cluster ${cluster.label}`}
                />
              </Hidden>
              <Hidden smDown>
                <StyledActionButton
                  disabled={Boolean(dashboardError) || !dashboard}
                  endIcon={<OpenInNewIcon sx={{ height: '14px' }} />}
                  onClick={() => window.open(dashboard?.url, '_blank')}
                >
                  Kubernetes Dashboard
                </StyledActionButton>
                <StyledActionButton onClick={() => setIsDeleteDialogOpen(true)}>
                  Delete Cluster
                </StyledActionButton>
              </Hidden>
            </Box>
          </EntityHeader>
        }
      />

      <KubeConfigDrawer
        closeDrawer={() => setDrawerOpen(false)}
        clusterId={cluster.id}
        clusterLabel={cluster.label}
        open={drawerOpen}
      />
      <KubeControlPlaneACLDrawer
        closeDrawer={() => setControlPlaneACLDrawerOpen(false)}
        clusterId={cluster.id}
        clusterLabel={cluster.label}
        clusterMigrated={!isErrorKubernetesACL}
        open={isControlPlaneACLDrawerOpen}
        showControlPlaneACL={!!showControlPlaneACL}
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
    </Box>
  );
});
