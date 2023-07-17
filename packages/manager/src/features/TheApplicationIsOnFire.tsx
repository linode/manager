import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { DialogTitle } from 'src/components/DialogTitle/DialogTitle';
import { Typography } from 'src/components/Typography';
import Dialog from 'src/components/core/Dialog';
import DialogContent from 'src/components/core/DialogContent';

const useStyles = makeStyles((theme: Theme) => ({
  restartButton: {
    ...theme.applyLinkStyles,
  },
}));

const TheApplicationIsOnFire: React.FC<{}> = (props) => {
  return (
    <Dialog PaperProps={{ role: undefined }} open role="dialog">
      <DialogTitle title="Oh snap!" />
      <DialogContent>
        <Typography style={{ marginBottom: 16 }} variant="subtitle1">
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
