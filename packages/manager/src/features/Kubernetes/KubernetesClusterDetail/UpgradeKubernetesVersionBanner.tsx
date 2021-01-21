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

  const [dialogOpen, setDialogOpen] = React.useState(false);

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
              <Button onClick={() => setDialogOpen(true)} buttonType="primary">
                Upgrade Version
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ) : null}
      <UpgradeDialog
        clusterID={clusterID}
        currentVersion={currentVersion}
        nextVersion={nextVersion ?? ''}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

interface DialogProps {
  clusterID: number;
  isOpen: boolean;
  onClose: () => void;
}

interface UpgradeDialogProps extends DialogProps {
  currentVersion: string;
  nextVersion: string;
}

// Upgrade Confirmation Dialog (Step 1)

export const UpgradeDialog: React.FC<UpgradeDialogProps> = React.memo(props => {
  const { clusterID, currentVersion, nextVersion, isOpen, onClose } = props;
  const { enqueueSnackbar } = useSnackbar();

  const { updateKubernetesCluster } = useKubernetesClusters();

  const [hasUpdatedSuccessfully, setHasUpdatedSuccessfully] = React.useState(
    false
  );

  const [error, setError] = React.useState<string | undefined>();
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setError(undefined);
      setSubmitting(false);
      setHasUpdatedSuccessfully(false);
    }
  }, [isOpen]);

  const onSubmitUpgradeDialog = () => {
    setSubmitting(true);
    setError(undefined);
    updateKubernetesCluster(clusterID, {
      k8s_version: nextVersion
    })
      .then(_ => {
        setHasUpdatedSuccessfully(true);
        setSubmitting(false);
      })
      .catch(e => {
        setSubmitting(false);
        setError(e[0].reason);
      });
  };

  const onSubmitRecycleDialog = () => {
    setSubmitting(true);
    setError(undefined);
    recycleClusterNodes(clusterID)
      .then(_ => {
        enqueueSnackbar('Recycle started successfully.', {
          variant: 'success'
        });
        onClose();
      })
      .catch(e => {
        setSubmitting(false);
        setError(e[0].reason);
      });
  };

  const dialogTitle = hasUpdatedSuccessfully
    ? `Step 2: Recycle All Cluster Nodes`
    : `Step 1: Update to Kubernetes ${nextVersion}`;

  const actions = hasUpdatedSuccessfully ? (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="cancel" onClick={onClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        destructive
        onClick={onSubmitRecycleDialog}
        loading={submitting}
        data-qa-confirm
      >
        Recycle All Nodes
      </Button>
    </ActionsPanel>
  ) : (
    <ActionsPanel style={{ padding: 0 }}>
      <Button buttonType="cancel" onClick={onClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        destructive
        onClick={onSubmitUpgradeDialog}
        loading={submitting}
        data-qa-confirm
      >
        Upgrade Version
      </Button>
    </ActionsPanel>
  );

  return (
    <Dialog
      title={dialogTitle}
      error={error}
      open={isOpen}
      onClose={onClose}
      actions={actions}
    >
      {hasUpdatedSuccessfully ? (
        <>
          Kubernetes version has been updated successfully. For the changes to
          take full effect you must recycle the nodes in your cluster.
        </>
      ) : (
        <>
          Upgrade this cluster&apos;s Kubernetes version from{' '}
          <strong>{currentVersion}</strong> to <strong>{nextVersion}</strong>?
          Once the upgrade is complete you will need to recycle all nodes in
          your cluster.
        </>
      )}
    </Dialog>
  );
});

export default React.memo(UpgradeKubernetesVersionBanner);
