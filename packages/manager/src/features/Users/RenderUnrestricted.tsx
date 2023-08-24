import * as React from 'react';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

export const RenderUnrestricted = () => {
  /* TODO: render all permissions disabled with this message above */
  return (
    <Paper
      sx={(theme) => ({
        marginTop: theme.spacing(2),
        padding: theme.spacing(3),
      })}
    >
      <Typography data-qa-unrestricted-msg>
        This user has unrestricted access to the account.
      </Typography>
    </Paper>
  );
};
