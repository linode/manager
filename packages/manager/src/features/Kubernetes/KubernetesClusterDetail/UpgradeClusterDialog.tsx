import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CheckBox from 'src/components/CheckBox';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { HIGH_AVAILABILITY_PRICE } from 'src/constants';
import { useKubernetesClusterMutation } from 'src/queries/kubernetes';
import { HACopy } from '../KubeCheckoutBar/HACheckbox';
import { useSnackbar } from 'notistack';
import {
  localStorageWarning,
  nodesDeletionWarning,
} from 'src/features/Kubernetes/kubeUtils';

const useStyles = makeStyles((theme: Theme) => ({
  noticeHeader: {
    fontSize: '0.875rem',
  },
  noticeList: {
    fontSize: '0.875rem',
    marginTop: 4,
    paddingLeft: theme.spacing(2),
    '& li': {
      marginBottom: 4,
    },
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  clusterID: number;
}

export const UpgradeKubernetesClusterToHADialog = (props: Props) => {
  const { open, onClose, clusterID } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [checked, setChecked] = React.useState(false);

  const toggleChecked = () => setChecked((isChecked) => !isChecked);

  const { mutateAsync: updateKubernetesCluster } = useKubernetesClusterMutation(
    clusterID
  );
  const [error, setError] = React.useState<string | undefined>();
  const [submitting, setSubmitting] = React.useState(false);
  const classes = useStyles();

  const onUpgrade = () => {
    setSubmitting(true);
    setError(undefined);
    updateKubernetesCluster({
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

  const actions = (
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
        disabled={!checked}
        loading={submitting}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Upgrade to HA
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      open={open}
      title="Upgrade to High Availability"
      onClose={onClose}
      actions={actions}
      error={error}
    >
      <HACopy />
      <Typography variant="body1" style={{ marginTop: 12, marginBottom: 8 }}>
        Pricing for the HA control plane is ${HIGH_AVAILABILITY_PRICE} per month
        per cluster.
      </Typography>
      <Notice warning spacingTop={16} spacingBottom={16}>
        <Typography variant="h3" className={classes.noticeHeader}>
          Caution:
        </Typography>
        <ul className={classes.noticeList}>
          <li>{nodesDeletionWarning}</li>
          <li>{localStorageWarning}</li>
          <li>
            This may take several minutes, as nodes will be replaced on a
            rolling basis.
          </li>
        </ul>
      </Notice>
      <CheckBox
        checked={checked}
        onChange={toggleChecked}
        text="I agree to the additional fee on my monthly bill and understand HA upgrade can only be reversed by deleting my cluster."
      />
    </ConfirmationDialog>
  );
};
