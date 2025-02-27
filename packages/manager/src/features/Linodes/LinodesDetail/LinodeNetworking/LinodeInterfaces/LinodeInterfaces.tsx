import { Box, Button, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';

import { LinodeInterfacesTable } from './LinodeInterfacesTable';

interface Props {
  linodeId: number;
}

export const LinodeInterfaces = ({ linodeId }: Props) => {
  return (
    <Box>
      <Paper
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          pl: 2,
          pr: 0.5,
          py: 0.5,
        }}
      >
        <Typography variant="h3">Network Interfaces</Typography>
        <Stack direction="row" spacing={1}>
          <Button buttonType="secondary">Interface History</Button>
          <Button buttonType="primary">Add Network Interface</Button>
        </Stack>
      </Paper>
      <LinodeInterfacesTable linodeId={linodeId} />
    </Box>
  );
};
