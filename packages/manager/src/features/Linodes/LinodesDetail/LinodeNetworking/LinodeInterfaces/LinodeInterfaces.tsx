import { Box, Button, Paper, Typography } from '@linode/ui';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { AddInterfaceDrawer } from './AddInterfaceDrawer/AddInterfaceDrawer';
import { DeleteInterfaceDialog } from './DeleteInterfaceDialog';
import { InterfaceDetailsDrawer } from './InterfaceDetailsDrawer/InterfaceDetailsDrawer';
import { LinodeInterfacesTable } from './LinodeInterfacesTable';

interface Props {
  linodeId: number;
}

export const LinodeInterfaces = ({ linodeId }: Props) => {
  const location = useLocation();
  const history = useHistory();

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInterfaceId, setSelectedInterfaceId] = useState<number>();

  const onDelete = (interfaceId: number) => {
    setSelectedInterfaceId(interfaceId);
    setIsDeleteDialogOpen(true);
  };

  const onShowDetails = (interfaceId: number) => {
    setSelectedInterfaceId(interfaceId);
    history.replace(`${location.pathname}/interfaces/${interfaceId}`);
  };

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
      <LinodeInterfacesTable
        handlers={{ onDelete, onShowDetails }}
        linodeId={linodeId}
      />
      <AddInterfaceDrawer
        linodeId={linodeId}
        onClose={() => setIsAddDrawerOpen(false)}
        open={isAddDrawerOpen}
      />
      <DeleteInterfaceDialog
        interfaceId={selectedInterfaceId}
        linodeId={linodeId}
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
      />
      <InterfaceDetailsDrawer
        onClose={() => {
          history.replace(`/linodes/${linodeId}/networking`);
        }}
        interfaceId={selectedInterfaceId}
        linodeId={linodeId}
        open={location.pathname.includes('interfaces')}
      />
    </Box>
  );
};
