import { Dialog, Typography } from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import type { Theme } from '@mui/material/styles';

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
