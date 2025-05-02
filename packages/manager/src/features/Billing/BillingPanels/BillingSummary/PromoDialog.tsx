import { addPromotion } from '@linode/api-v4/lib';
import { ActionsPanel, TextField, Typography } from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { accountQueries } from '@linode/queries';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { APIError } from '@linode/api-v4/lib/types';

const useStyles = makeStyles()(() => ({
  input: {
    maxWidth: 'unset',
    width: '100%',
  },
}));

interface Props {
  onClose: () => void;
  open: boolean;
}

const PromoDialog = (props: Props) => {
  const { onClose, open } = props;
  const { classes } = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [promoCode, setPromoCode] = React.useState<string>('');
  const [error, setError] = React.useState<string>();
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (open) {
      setPromoCode('');
      setLoading(false);
      setError(undefined);
    }
  }, [open]);

  const addPromo = () => {
    setLoading(true);
    setError(undefined);
    addPromotion(promoCode)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Successfully applied promo to your account.', {
          variant: 'success',
        });
        queryClient.invalidateQueries({
          queryKey: accountQueries.account.queryKey,
        });
        onClose();
      })
      .catch((error: APIError[]) => {
        setLoading(false);
        setError(
          getAPIErrorOrDefault(error, 'Unable to add promo code')[0].reason
        );
      });
  };

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        disabled: !promoCode,
        label: 'Apply Promo Code',
        loading,
        onClick: addPromo,
      }}
      secondaryButtonProps={{ label: 'Cancel', onClick: onClose }}
    />
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={error}
      onClose={onClose}
      open={open}
      title="Add promo code"
    >
      <Typography>
        Enter the promo code in the field below. You will see promo details in
        the Promotions panel on the Billing Info tab.
      </Typography>
      <TextField
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setPromoCode(e.target.value)
        }
        className={classes.input}
        label="Promo code"
        value={promoCode}
      />
    </ConfirmationDialog>
  );
};

export default PromoDialog;
