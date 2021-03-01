import * as React from 'react';
import Dialog from 'src/components/core/Dialog';
import DialogContent from 'src/components/core/DialogContent';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DialogTitle from 'src/components/DialogTitle';

const useStyles = makeStyles((theme: Theme) => ({
  restartButton: {
    ...theme.applyLinkStyles,
  },
}));

const TheApplicationIsOnFire: React.FC<{}> = (props) => {
  return (
    <Dialog
      open
      disableBackdropClick={true}
      PaperProps={{ role: undefined }}
      role="dialog"
    >
      <DialogTitle title="Oh snap!" />
      <DialogContent>
        <Typography variant="subtitle1" style={{ marginBottom: 16 }}>
          Something went terribly wrong. Please {<ReloadLink />} and try again.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

const ReloadLink = () => {
  const classes = useStyles();

  return (
    <button
      onClick={() => {
        location.reload();
      }}
      className={classes.restartButton}
    >
      reload the page
    </button>
  );
};

export default TheApplicationIsOnFire;
