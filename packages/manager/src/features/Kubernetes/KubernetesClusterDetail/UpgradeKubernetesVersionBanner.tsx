import {
  KubernetesVersion,
  recycleClusterNodes
} from '@linode/api-v4/lib/kubernetes';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Dialog from 'src/components/ConfirmationDialog';
import Grid from 'src/components/Grid';
import { useDialog } from 'src/hooks/useDialog';
import useKubernetesClusters from 'src/hooks/useKubernetesClusters';
import { useKubernetesVersionQuery } from 'src/queries/kubernetesVersion';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    fontSize: '1rem',
    borderLeft: `solid 6px ${theme.color.green}`,
    padding: theme.spacing(1),
    marginBottom: theme.spacing()
  },
  upgradeMessage: {
    marginLeft: theme.spacing()
  }
}));

interface Props {
  clusterID: number;
  currentVersion: string;
}

export type CombinedProps = Props;

export const getNextVersion = (
  currentVersion: string,
  versions: KubernetesVersion[]
) => {
  const versionStrings = versions.map(v => v.id).sort();
  const currentIdx = versionStrings.findIndex(
    thisVersion => currentVersion === thisVersion
  );
  if (currentIdx < 0 || currentIdx === versions.length - 1) {
    return null;
  }
  return versionStrings[currentIdx + 1];
};

export const UpgradeKubernetesVersionBanner: React.FC<Props> = props => {
  const { clusterID, currentVersion } = props;
  const classes = useStyles();
  const { data: versions } = useKubernetesVersionQuery();
  const nextVersion = getNextVersion(currentVersion, versions ?? []);
  const { enqueueSnackbar } = useSnackbar();

  const { updateKubernetesCluster } = useKubernetesClusters();

  const onSubmitUpgradeDialog = (nextVersion: string) =>
    updateKubernetesCluster(clusterID, {
      k8s_version: nextVersion
    }).then(_ => {
      recycleNodesDialog.openDialog(undefined);
    });

  const onSubmitRecycleDialog = () =>
    recycleClusterNodes(clusterID).then(_ =>
      enqueueSnackbar('Recycle started successfully.', {
        variant: 'success'
      })
    );

  const confirmUpgradeDialog = useDialog(() =>
    onSubmitUpgradeDialog(nextVersion ?? '')
  );
  const recycleNodesDialog = useDialog(onSubmitRecycleDialog);

  return (
    <>
      {nextVersion ? (
        <Paper className={classes.root}>
          <Grid
            container
            direction="row"
            alignItems="center"
            justify="space-between"
          >
            <Grid item>
              <Typography className={classes.upgradeMessage}>
                A new version of Kubernetes is available ({nextVersion}).
              </Typography>
            </Grid>
            <Grid item>
              <Button
                onClick={() => confirmUpgradeDialog.openDialog(undefined)}
                buttonType="primary"
              >
                Upgrade Version
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ) : null}
      <UpgradeDialog
        currentVersion={currentVersion}
        nextVersion={nextVersion ?? ''}
        error={confirmUpgradeDialog.dialog.error}
        isOpen={confirmUpgradeDialog.dialog.isOpen}
        isLoading={confirmUpgradeDialog.dialog.isLoading}
        onClose={confirmUpgradeDialog.closeDialog}
        onSubmit={() => confirmUpgradeDialog.submitDialog(undefined)}
      >
        Upgrade this cluster&apos;s Kubernetes version from{' '}
        <strong>{currentVersion}</strong> to <strong>{nextVersion}</strong>?
        Once the upgrade is complete you will need to recycle all nodes in your
        cluster.
      </UpgradeDialog>
      <RecycleDialog
        isOpen={recycleNodesDialog.dialog.isOpen}
        isLoading={recycleNodesDialog.dialog.isLoading}
        error={recycleNodesDialog.dialog.error}
        onClose={recycleNodesDialog.closeDialog}
        onSubmit={() => recycleNodesDialog.submitDialog(undefined)}
      >
        Kubernetes version has been updated successfully. For the changes to
        take effect, you must recycle all nodes in your cluster. All nodes will
        be deleted and new nodes will be created to replace them. Any local
        storage (such as &apos;hostPath&apos; volumes) will be erased. This may
        take several minutes, as nodes will be replaced on a rolling basis.
      </RecycleDialog>
    </>
  );
};

interface DialogProps {
  isOpen: boolean;
  isLoading: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: () => void;
}

interface UpgradeDialogProps extends DialogProps {
  currentVersion: string;
  nextVersion: string;
}

// Upgrade Confirmation Dialog (Step 1)

export const UpgradeDialog: React.FC<UpgradeDialogProps> = React.memo(props => {
  const {
    currentVersion,
    nextVersion,
    error,
    isOpen,
    isLoading,
    onClose,
    onSubmit
  } = props;

  return (
    <Dialog
      title={`Step 1: Upgrade to Kubernetes ${nextVersion}`}
      error={error}
      open={isOpen}
      onClose={onClose}
      actions={
        <ActionsPanel style={{ padding: 0 }}>
          <Button buttonType="cancel" onClick={onClose} data-qa-cancel>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            destructive
            onClick={onSubmit}
            loading={isLoading}
            data-qa-confirm
          >
            Upgrade Version
          </Button>
        </ActionsPanel>
      }
    >
      Upgrade this cluster&apos;s Kubernetes version from{' '}
      <strong>{currentVersion}</strong> to <strong>{nextVersion}</strong>? Once
      the upgrade is complete you will need to recycle all nodes in your
      cluster.
    </Dialog>
  );
});

// Recycle Dialog (Step 2)
export const RecycleDialog: React.FC<DialogProps> = React.memo(props => {
  const { error, isOpen, isLoading, onClose, onSubmit } = props;
  return (
    <Dialog
      title={`Step 2: Recycle All Cluster Nodes`}
      error={error}
      open={isOpen}
      onClose={onClose}
      actions={
        <ActionsPanel style={{ padding: 0 }}>
          <Button buttonType="cancel" onClick={onClose} data-qa-cancel>
            Cancel
          </Button>
          <Button
            buttonType="primary"
            destructive
            onClick={onSubmit}
            loading={isLoading}
            data-qa-confirm
          >
            Recycle All Nodes
          </Button>
        </ActionsPanel>
      }
    >
      Kubernetes version has been updated successfully. For the changes to take
      full effect you must recycle the nodes in your cluster.
    </Dialog>
  );
});

export default React.memo(UpgradeKubernetesVersionBanner);
