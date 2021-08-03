import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';

const useStyles = makeStyles(() => ({
  input: {
    maxWidth: 'unset',
    width: '100%',
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
}

const PromoDialog: React.FC<Props> = (props) => {
  const { open, onClose } = props;
  const classes = useStyles();
  const [promoCode, setPromoCode] = React.useState<string>();
  const [error, setError] = React.useState<string>();

  const actions = () => (
    <ActionsPanel>
      <Button buttonType="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        // onClick={onAdd}
        // disabled={}
        // loading={loading}
      >
        Apply Promo Code
      </Button>
    </ActionsPanel>
  );

  return (
    <ConfirmationDialog
      title="Add promo code"
      open={open}
      onClose={onClose}
      actions={actions}
    >
      {error && <Notice error text={error} />}
      <Typography>
        Paste the promo code in the field below. You will see promo details in
        the Promotions panel on the Billing Info tab.
      </Typography>
      <TextField
        label="Promo code"
        value={promoCode}
        className={classes.input}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setPromoCode(e.target.value)
        }
      />
    </ConfirmationDialog>
  );
};

export default PromoDialog;
