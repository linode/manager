import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import CheckBox from 'src/components/CheckBox';
import useKubernetesClusters from 'src/hooks/useKubernetesClusters';
import { HIGH_AVAILABILITY_PRICE } from 'src/constants';
import { HACopy } from '../KubeCheckoutBar/HACheckbox';
import { useSnackbar } from 'notistack';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  noticeHeader: {
    fontWeight: 'bold',
  },
  noticeList: {
    paddingLeft: theme.spacing(2),
    marginTop: theme.spacing(),
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  clusterID: number;
}

const renderActions = (
  disabled: boolean,
  onClose: () => void,
  onUpgrade: () => void
) => {
  return (
    <ActionsPanel>
      <Button
        buttonType="secondary"
        onClick={onClose}
        data-qa-cancel
        data-testid={'dialog-cancel'}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={onUpgrade}
        disabled={disabled}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Upgrade to HA
      </Button>
    </ActionsPanel>
  );
};

const UpgradeClusterDialog: React.FC<Props> = (props) => {
  const { open, onClose, clusterID } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [checked, setChecked] = React.useState(false);
  const toggleChecked = () => setChecked((isChecked) => !isChecked);

  const { updateKubernetesCluster } = useKubernetesClusters();
  const [error, setError] = React.useState<string | undefined>();
  const [submitting, setSubmitting] = React.useState(false);
  const classes = useStyles();

  const onUpgrade = () => {
    setSubmitting(true);
    setError(undefined);
    updateKubernetesCluster(clusterID, {
      control_plane: { high_availability: true },
    })
      .then(() => {
        setSubmitting(false);
        enqueueSnackbar('Enabled HA Control Plane', { variant: 'success' });
        onClose();
      })
      .catch((e) => {
        setSubmitting(false);
        setError(e[0].reason);
      });
  };

  return (
    <ConfirmationDialog
      open={open}
      title="Upgrade to High Availability"
      onClose={onClose}
      actions={renderActions(!checked || submitting, onClose, onUpgrade)}
      error={error}
    >
      <HACopy />
      <Typography variant="body1" style={{ marginTop: 12, marginBottom: 8 }}>
        Pricing for the HA control plane is ${HIGH_AVAILABILITY_PRICE} per month
        per cluster.
      </Typography>
      <Notice warning>
        <Typography className={classes.noticeHeader}>Caution:</Typography>
        <Typography>
          <ul className={classes.noticeList}>
            <li>
              All nodes will be deleted and new nodes will be created to replace
              them.
            </li>
            <li>
              Any local storage (such as &apos;hostPath&apos; volumes) will be
              erased.
            </li>
            <li>
              This may take several minutes, as nodes will be replaced on a
              rolling basis.
            </li>
          </ul>
        </Typography>
      </Notice>
      <CheckBox
        checked={checked}
        onChange={toggleChecked}
        text="I agree to the additional fee on my monthly bill and understand HA upgrade can only be reversed by deleting my cluster."
      />
    </ConfirmationDialog>
  );
};

export default UpgradeClusterDialog;
