import {
  ActionsPanel,
  Checkbox,
  CircleProgress,
  Notice,
  Typography,
} from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import {
  localStorageWarning,
  nodesDeletionWarning,
} from 'src/features/Kubernetes/constants';
import {
  useKubernetesClusterMutation,
  useKubernetesTypesQuery,
} from 'src/queries/kubernetes';
import { HA_UPGRADE_PRICE_ERROR_MESSAGE } from 'src/utilities/pricing/constants';
import { getDCSpecificPriceByType } from 'src/utilities/pricing/dynamicPricing';

import { HACopy } from '../CreateCluster/HAControlPlane';

import type { Theme } from '@mui/material/styles';

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
  onClose: () => void;
  open: boolean;
  regionID: string;
}

export const UpgradeKubernetesClusterToHADialog = React.memo((props: Props) => {
  const { clusterID, onClose, open, regionID } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [checked, setChecked] = React.useState(false);
  const toggleChecked = () => setChecked((isChecked) => !isChecked);

  const { mutateAsync: updateKubernetesCluster } =
    useKubernetesClusterMutation(clusterID);
  const [error, setError] = React.useState<string | undefined>();
  const [submitting, setSubmitting] = React.useState(false);
  const { classes } = useStyles();

  const {
    data: kubernetesHighAvailabilityTypesData,
    isError: isErrorKubernetesTypes,
    isLoading: isLoadingKubernetesTypes,
  } = useKubernetesTypesQuery();

  const lkeHAType = kubernetesHighAvailabilityTypesData?.find(
    (type) => type.id === 'lke-ha'
  );

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

  const highAvailabilityPrice = getDCSpecificPriceByType({
    regionId: regionID,
    type: lkeHAType,
  });

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
        <CircleProgress size="sm" sx={{ marginTop: 2 }} />
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
                {highAvailabilityPrice} per month per cluster.
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
