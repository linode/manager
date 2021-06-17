import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import GooglePay from 'src/assets/icons/payment/googlePay.svg';

interface Props {
  open: boolean;
  onClose: () => void;
}

const useStyles = makeStyles(() => ({
  root: {
    marginTop: '4px',
  },
  paymentMethodName: {
    color: '#171718',
  },
}));

export const AddPaymentMethodDrawer: React.FC<Props> = (props) => {
  const { onClose, open } = props;
  const classes = useStyles();

  return (
    <Drawer title="Add a Payment Method" open={open} onClose={onClose}>
      <Divider />
      <Grid container spacing={2} className={classes.root}>
        <Grid item xs={12} sm container>
          <Grid item xs container direction="column" spacing={4}>
            <Grid item xs>
              <Typography
                className={classes.paymentMethodName}
                variant="subtitle1"
              >
                Google Pay
              </Typography>
              <Typography>
                You&apos;ll be taken to Google Pay to complete sign up.
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <Typography>
              <GooglePay />
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Drawer>
  );
};

export default AddPaymentMethodDrawer;
