import { KubernetesVersion } from '@linode/api-v4/lib/kubernetes/types';
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

  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const onClose = () => setConfirmDialogOpen(false);
  const { updateKubernetesCluster } = useKubernetesClusters();

  const onSubmit = (nextVersion: string) => {
    updateKubernetesCluster(clusterID, { k8s_version: nextVersion });
  };

  if (!nextVersion) {
    return null;
  }

  return (
    <>
      <Paper className={classes.root}>
        <Grid
          container
          direction="row"
          alignItems="center"
          justify="space-between"
        >
          <Grid item>
            <Typography className={classes.upgradeMessage}>
              A new version of Kubernetes is available.
            </Typography>
          </Grid>
          <Grid item>
            <Button
              onClick={() => setConfirmDialogOpen(true)}
              buttonType="primary"
            >
              Upgrade Version
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <Dialog
        title={`Upgrade to Kubernetes ${nextVersion}?`}
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        actions={
          <ActionsPanel style={{ padding: 0 }}>
            <Button buttonType="cancel" onClick={onClose} data-qa-cancel>
              Cancel
            </Button>
            <Button
              buttonType="primary"
              destructive
              onClick={() => onSubmit(nextVersion)}
              loading={false}
              data-qa-confirm
            >
              Upgrade
            </Button>
          </ActionsPanel>
        }
      >
        Upgrade Kubernetes from {currentVersion} to {nextVersion}? Once the
        upgrade is complete you will need to recycle the nodes in your cluster.
      </Dialog>
    </>
  );
};

export default React.memo(UpgradeKubernetesVersionBanner);
