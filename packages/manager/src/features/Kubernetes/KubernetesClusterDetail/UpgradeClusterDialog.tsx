import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Checkbox } from 'src/components/Checkbox';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { displayPrice } from 'src/components/DisplayPrice';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import {
  localStorageWarning,
  nodesDeletionWarning,
} from 'src/features/Kubernetes/kubeUtils';
import { useFlags } from 'src/hooks/useFlags';
import { useKubernetesClusterMutation } from 'src/queries/kubernetes';
import { LKE_HA_PRICE } from 'src/utilities/pricing/constants';
import { getDCSpecificPrice } from 'src/utilities/pricing/dynamicPricing';

import { HACopy } from '../CreateCluster/HAControlPlane';

const useStyles = makeStyles((theme: Theme) => ({
  noticeHeader: {
    fontSize: '0.875rem',
  },
  noticeList: {
    '& li': {
      marginBottom: 4,
    },
    fontSize: '0.875rem',
    marginTop: 4,
    paddingLeft: theme.spacing(2),
  },
}));

interface Props {
  clusterID: number;
  onClose: () => void;
  open: boolean;
  regionID: string;
}

export const UpgradeKubernetesClusterToHADialog = (props: Props) => {
  const { clusterID, onClose, open, regionID } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [checked, setChecked] = React.useState(false);

  const toggleChecked = () => setChecked((isChecked) => !isChecked);

  const { mutateAsync: updateKubernetesCluster } = useKubernetesClusterMutation(
    clusterID
  );
  const [error, setError] = React.useState<string | undefined>();
  const [submitting, setSubmitting] = React.useState(false);
  const classes = useStyles();
  const flags = useFlags();

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
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'confirm',
        disabled: !checked,
        label: 'Upgrade to HA',
        loading: submitting,
        onClick: onUpgrade,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Cancel',
        onClick: onClose,
      }}
    />
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={error}
      onClose={onClose}
      open={open}
      title="Upgrade to High Availability"
    >
      <HACopy />
      <Typography style={{ marginBottom: 8, marginTop: 12 }} variant="body1">
        {flags.dcSpecificPricing
          ? `For this region, pricing for the HA control plane is $${getDCSpecificPrice(
              {
                basePrice: LKE_HA_PRICE,
                flags,
                regionId: regionID,
              }
            )}`
          : `Pricing for the HA control plane is ${displayPrice(LKE_HA_PRICE)}`}
        &nbsp;per month per cluster.
      </Typography>
      <Notice spacingBottom={16} spacingTop={16} warning>
        <Typography className={classes.noticeHeader} variant="h3">
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
      <Checkbox
        checked={checked}
        onChange={toggleChecked}
        text="I agree to the additional fee on my monthly bill and understand HA upgrade can only be reversed by deleting my cluster."
      />
    </ConfirmationDialog>
  );
};
