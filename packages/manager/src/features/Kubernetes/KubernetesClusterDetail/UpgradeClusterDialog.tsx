import { Theme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Checkbox } from 'src/components/Checkbox';
import { CircularProgress } from 'src/components/CircularProgress';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import {
  localStorageWarning,
  nodesDeletionWarning,
} from 'src/features/Kubernetes/kubeUtils';
import { useKubernetesClusterMutation } from 'src/queries/kubernetes';
import { getDCSpecificPriceByType } from 'src/utilities/pricing/dynamicPricing';

import { HACopy } from '../CreateCluster/HAControlPlane';

import type { PriceType, Region } from '@linode/api-v4';

export const HA_UPGRADE_PRICE_ERROR_MESSAGE =
  'Upgrading to HA is not available at this time. Try again later.';

const useStyles = makeStyles()((theme: Theme) => ({
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
  isErrorKubernetesTypes: boolean;
  isLoadingKubernetesTypes: boolean;
  kubernetesHighAvailabilityTypesData: PriceType[] | undefined;
  onClose: () => void;
  open: boolean;
  regionID: string;
}

export const UpgradeKubernetesClusterToHADialog = React.memo((props: Props) => {
  const {
    clusterID,
    isErrorKubernetesTypes,
    isLoadingKubernetesTypes,
    kubernetesHighAvailabilityTypesData,
    onClose,
    open,
    regionID,
  } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [checked, setChecked] = React.useState(false);

  const toggleChecked = () => setChecked((isChecked) => !isChecked);

  const { mutateAsync: updateKubernetesCluster } = useKubernetesClusterMutation(
    clusterID
  );
  const [error, setError] = React.useState<string | undefined>();
  const [submitting, setSubmitting] = React.useState(false);
  const { classes } = useStyles();

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

  const getHighAvailabilityPrice = (regionId: Region['id'] | null) => {
    const dcSpecificPrice = regionId
      ? getDCSpecificPriceByType({
          regionId,
          type: kubernetesHighAvailabilityTypesData?.[1],
        })
      : undefined;

    return dcSpecificPrice ? parseFloat(dcSpecificPrice) : undefined;
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
      {isLoadingKubernetesTypes ? (
        <CircularProgress size={16} sx={{ marginTop: 2 }} />
      ) : (
        <>
          <HACopy />
          {isErrorKubernetesTypes ? (
            <Notice spacingBottom={16} spacingTop={16} variant="error">
              <Typography>{HA_UPGRADE_PRICE_ERROR_MESSAGE}</Typography>
            </Notice>
          ) : (
            <>
              <Typography
                style={{ marginBottom: 8, marginTop: 12 }}
                variant="body1"
              >
                For this region, pricing for the HA control plane is $
                {getHighAvailabilityPrice(regionID)} per month per cluster.
              </Typography>
              <Notice spacingBottom={16} spacingTop={16} variant="warning">
                <Typography className={classes.noticeHeader} variant="h3">
                  Caution:
                </Typography>
                <ul className={classes.noticeList}>
                  <li>{nodesDeletionWarning}</li>
                  <li>{localStorageWarning}</li>
                  <li>
                    This may take several minutes, as nodes will be replaced on
                    a rolling basis.
                  </li>
                </ul>
              </Notice>
              <Checkbox
                checked={checked}
                onChange={toggleChecked}
                text="I agree to the additional fee on my monthly bill and understand HA upgrade can only be reversed by deleting my cluster."
              />
            </>
          )}
        </>
      )}
    </ConfirmationDialog>
  );
});
