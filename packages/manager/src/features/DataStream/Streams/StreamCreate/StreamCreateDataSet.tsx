import { Box, Paper, Typography } from '@linode/ui';
import React from 'react';

import { DocsLink } from 'src/components/DocsLink/DocsLink';

export const StreamCreateDataSet = () => {
  return (
    <Paper>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h2">Data Set</Typography>
        <DocsLink
          // TODO: Change the link when proper documentation is ready
          href="https://techdocs.akamai.com/cloud-computing/docs"
          label="Docs"
        />
      </Box>
    </Paper>
  );
};
