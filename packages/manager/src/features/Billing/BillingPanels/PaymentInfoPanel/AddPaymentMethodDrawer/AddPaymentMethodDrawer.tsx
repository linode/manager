import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import GooglePayChip from '../GooglePayChip';

interface Props {
  open: boolean;
  onClose: () => void;
}

const useStyles = makeStyles(() => ({
  root: {
    marginTop: '4px',
  },
}));

export const AddPaymentMethodDrawer: React.FC<Props> = (props) => {
  const { onClose, open } = props;
  const classes = useStyles();

  return (
    <Drawer title="Add a Payment Method" open={open} onClose={onClose}>
      <Divider />
      <Grid className={classes.root} container>
        <Grid item direction="column" xs={8} md={9}>
          <Typography variant="h3">Google Pay</Typography>
          <Typography>
            You&apos;ll be taken to Google Pay to complete sign up.
          </Typography>
        </Grid>
        <Grid item xs={4} md={3}>
          <GooglePayChip onClose={onClose} />
        </Grid>
      </Grid>
    </Drawer>
  );
};

export default AddPaymentMethodDrawer;
