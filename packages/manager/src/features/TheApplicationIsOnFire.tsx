import * as React from 'react';
import Dialog from 'src/components/core/Dialog';
import DialogContent from 'src/components/core/DialogContent';
import DialogTitle from 'src/components/core/DialogTitle';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

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
      <DialogTitle>Oh snap!</DialogTitle>
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
