import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

import { Dialog } from 'src/components/Dialog/Dialog';
import { Typography } from 'src/components/Typography';

const useStyles = makeStyles()((theme: Theme) => ({
  restartButton: {
    ...theme.applyLinkStyles,
  },
}));

const TheApplicationIsOnFire = () => {
  return (
    <Dialog open title="Oh snap!">
      <Typography style={{ marginBottom: 16 }} variant="subtitle1">
        Something went terribly wrong. Please {<ReloadLink />} and try again.
      </Typography>
    </Dialog>
  );
};

const ReloadLink = () => {
  const { classes } = useStyles();

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
