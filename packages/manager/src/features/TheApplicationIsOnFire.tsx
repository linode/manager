import * as React from 'react';
import Dialog from 'src/components/core/Dialog';
import DialogContent from 'src/components/core/DialogContent';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DialogTitle from 'src/components/DialogTitle';

const useStyles = makeStyles((theme: Theme) => ({
  restartButton: {
    background: 'none',
    color: theme.palette.primary.main,
    border: 'none',
    padding: 0,
    font: 'inherit',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
}));

const TheApplicationIsOnFire: React.StatelessComponent<{}> = props => {
  return (
    <Dialog open>
      <DialogTitle title="Oh snap!" />
      <DialogContent>
        <Typography>
          Something went terribly wrong. Did you try {<ReloadLink />}?
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
      role="button"
      className={classes.restartButton}
    >
      restarting it
    </button>
  );
};

export default TheApplicationIsOnFire;
