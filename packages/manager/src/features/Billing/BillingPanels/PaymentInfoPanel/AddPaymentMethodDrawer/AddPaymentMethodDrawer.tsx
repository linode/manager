import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import GooglePayChip from '../GooglePayChip';
import AddCreditCardForm from './AddCreditCardForm';

interface Props {
  open: boolean;
  onClose: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  methodGroup: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
}));

export const AddPaymentMethodDrawer: React.FC<Props> = (props) => {
  const { onClose, open } = props;
  const classes = useStyles();

  return (
    <Drawer title="Add a Payment Method" open={open} onClose={onClose}>
      <Divider />
      <Grid container spacing={1} className={classes.methodGroup}>
        <Grid item xs={12} sm container alignItems="center">
          <Grid item xs container direction="column" spacing={1}>
            <Grid item xs>
              <Typography variant="h3">Google Pay</Typography>
            </Grid>
            <Grid item xs>
              <Typography>
                You&apos;ll be taken to Google Pay to complete sign up.
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <GooglePayChip onAdd={onClose} />
          </Grid>
        </Grid>
      </Grid>
      <Divider spacingBottom={12} />
      <Grid>
        <Typography variant="h3">Credit Card</Typography>
        <AddCreditCardForm onClose={onClose} />
      </Grid>
    </Drawer>
  );
};

export default AddPaymentMethodDrawer;
