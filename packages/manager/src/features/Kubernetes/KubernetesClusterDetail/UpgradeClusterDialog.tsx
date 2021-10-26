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
      <Notice
        warning
        text="Upgrading to high availability cannot be reversed."
      />
      <HACopy />
      <Typography variant="body1" style={{ marginTop: 12, marginBottom: 8 }}>
        Pricing for the HA control plane is ${HIGH_AVAILABILITY_PRICE} per month
        per cluster. By completing this upgrade, you are agreeing to the
        additional fee on your monthly bill and understand the HA upgrade can
        only be reversed by deleting your cluster.
      </Typography>
      <CheckBox
        checked={checked}
        onChange={toggleChecked}
        text="Enable HA Control Plane"
      />
    </ConfirmationDialog>
  );
};

export default UpgradeClusterDialog;
