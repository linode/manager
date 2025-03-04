import { Box, Button, Paper, Typography } from '@linode/ui';
import React, { useState } from 'react';

import { AddInterfaceDrawer } from './AddInterfaceDrawer/AddInterfaceDrawer';
import { LinodeInterfacesTable } from './LinodeInterfacesTable';

interface Props {
  linodeId: number;
}

export const LinodeInterfaces = ({ linodeId }: Props) => {
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);

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
        <Button buttonType="primary" onClick={() => setIsAddDrawerOpen(true)}>
          Add Network Interface
        </Button>
      </Paper>
      <LinodeInterfacesTable linodeId={linodeId} />
      <AddInterfaceDrawer
        linodeId={linodeId}
        onClose={() => setIsAddDrawerOpen(false)}
        open={isAddDrawerOpen}
      />
    </Box>
  );
};
