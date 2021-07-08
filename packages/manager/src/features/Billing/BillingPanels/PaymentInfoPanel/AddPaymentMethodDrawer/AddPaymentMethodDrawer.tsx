import { useSnackbar, VariantType } from 'notistack';
import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import GooglePayChip from '../GooglePayChip';

interface Props {
  open: boolean;
  onClose: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: 4,
  },
  gpay: {
    '& button': {
      marginRight: -theme.spacing(2),
    },
  },
}));

export const AddPaymentMethodDrawer: React.FC<Props> = (props) => {
  const { onClose, open } = props;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const makeToast = (message: string, variant: VariantType) => {
    enqueueSnackbar(message, {
      variant,
    });
  };

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
        <Grid
          container
          item
          className={classes.gpay}
          xs={4}
          md={3}
          justify="flex-end"
          alignContent="center"
        >
          <GooglePayChip makeToast={makeToast} onClose={onClose} />
        </Grid>
      </Grid>
    </Drawer>
  );
};

export default AddPaymentMethodDrawer;
