import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import CheckBox from 'src/components/CheckBox';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import useKubernetesClusters from 'src/hooks/useKubernetesClusters';

const useStyles = makeStyles((theme: Theme) => ({
  heading: {
    paddingTop: theme.spacing(0.5),
    paddingButtom: theme.spacing(),
  },
  checkbox: {
    marginTop: -8,
    marginLeft: -8,
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  clusterID: number;
}

type CombinedProps = Props;

const renderActions = (
  disabled: boolean,
  onClose: () => void,
  onUpgrade: () => void
) => {
  return (
    <ActionsPanel style={{ padding: 0 }}>
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

const UpgradeClusterDialog: React.FC<CombinedProps> = (props) => {
  const { open, onClose, clusterID } = props;
  const classes = useStyles();
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
      })
      .catch((e) => {
        setSubmitting(false);
        setError(e[0].reason);
      });
  };

  return (
    <ConfirmationDialog
      open={open}
      title={'Upgrade to High Availability'}
      onClose={onClose}
      actions={() => renderActions(!checked || submitting, onClose, onUpgrade)}
      error={error}
    >
      <Notice
        warning
        text="Upgrading to high availability cannot be reversed."
      />
      <Typography variant="body1">
        A high availability (HA) control plane sets up Kubernetes with important
        components replicated on multiple masters so there is no single point of
        failure.
      </Typography>
      <Typography variant="body1">HA costs $69/month per cluster</Typography>
      <Box>
        <Box display="flex" flexDirection="row" alignItems="flex-start">
          <CheckBox
            className={classes.checkbox}
            checked={checked}
            onChange={toggleChecked}
          />
          <Typography className={classes.heading}>
            Enable HA Control Plane
          </Typography>
        </Box>
      </Box>
    </ConfirmationDialog>
  );
};

export default UpgradeClusterDialog;
