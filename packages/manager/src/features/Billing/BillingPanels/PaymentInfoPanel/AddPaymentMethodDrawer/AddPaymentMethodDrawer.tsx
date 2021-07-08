import { useSnackbar, VariantType } from 'notistack';
import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
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
  progress: {
    marginBottom: 18,
    width: '100%',
    height: 5,
  },
}));

export const AddPaymentMethodDrawer: React.FC<Props> = (props) => {
  const { onClose, open } = props;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (open) {
      setIsProcessing(false);
    }
  }, [open]);

  const makeToast = (message: string, variant: VariantType) => {
    enqueueSnackbar(message, {
      variant,
    });
  };

  return (
    <Drawer title="Add a Payment Method" open={open} onClose={onClose}>
      {isProcessing ? <LinearProgress className={classes.progress} /> : null}
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
          <GooglePayChip
            makeToast={makeToast}
            onClose={onClose}
            setProcessing={setIsProcessing}
            disabled={isProcessing}
          />
        </Grid>
      </Grid>
    </Drawer>
  );
};

export default AddPaymentMethodDrawer;
