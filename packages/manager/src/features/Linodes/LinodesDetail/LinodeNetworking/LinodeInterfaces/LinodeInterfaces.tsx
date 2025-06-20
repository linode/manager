import { Box, Button, Drawer, Paper, Stack, Typography } from '@linode/ui';
import { useNavigate, useParams } from '@tanstack/react-router';
import React, { useState } from 'react';

import { AddInterfaceDrawer } from './AddInterfaceDrawer/AddInterfaceDrawer';
import { DeleteInterfaceDialog } from './DeleteInterfaceDialog';
import { EditInterfaceDrawerContents } from './EditInterfaceDrawer/EditInterfaceDrawerContent';
import { InterfaceDetailsDrawer } from './InterfaceDetailsDrawer/InterfaceDetailsDrawer';
import { InterfaceSettingsForm } from './InterfaceSettingsForm';
import { LinodeInterfacesTable } from './LinodeInterfacesTable';

interface Props {
  linodeId: number;
  regionId: string;
}

export const LinodeInterfaces = ({ linodeId, regionId }: Props) => {
  const navigate = useNavigate();
  const { interfaceId } = useParams({
    strict: false,
  });

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);

  const [selectedInterfaceId, setSelectedInterfaceId] = useState<number>();

  const onDelete = (interfaceId: number) => {
    setSelectedInterfaceId(interfaceId);
    setIsDeleteDialogOpen(true);
  };

  const onEdit = (interfaceId: number) => {
    setSelectedInterfaceId(interfaceId);
    setIsEditDrawerOpen(true);
  };

  const onShowDetails = (interfaceId: number) => {
    setSelectedInterfaceId(interfaceId);
    navigate({
      to: '/linodes/$linodeId/networking/interfaces/$interfaceId',
      params: { linodeId, interfaceId },
      search: {
        delete: undefined,
        migrate: undefined,
        rebuild: undefined,
        rescue: undefined,
        resize: undefined,
        selectedImageId: undefined,
        upgrade: undefined,
      },
    });
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
        <Stack direction="row" spacing={1}>
          <Button onClick={() => setIsSettingsDrawerOpen(true)}>
            Interface Settings
          </Button>
          <Button buttonType="primary" onClick={() => setIsAddDrawerOpen(true)}>
            Add Network Interface
          </Button>
        </Stack>
      </Paper>
      <LinodeInterfacesTable
        handlers={{ onDelete, onEdit, onShowDetails }}
        linodeId={linodeId}
      />
      <AddInterfaceDrawer
        linodeId={linodeId}
        onClose={() => setIsAddDrawerOpen(false)}
        open={isAddDrawerOpen}
        regionId={regionId}
      />
      <DeleteInterfaceDialog
        interfaceId={selectedInterfaceId}
        linodeId={linodeId}
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
      />
      <InterfaceDetailsDrawer
        interfaceId={selectedInterfaceId}
        linodeId={linodeId}
        onClose={() =>
          navigate({
            to: '/linodes/$linodeId/networking/interfaces',
            params: { linodeId },
            search: (prev) => prev,
          })
        }
        open={Boolean(interfaceId)}
      />
      <Drawer
        onClose={() => setIsEditDrawerOpen(false)}
        open={isEditDrawerOpen}
        title={`Edit Network Interface${selectedInterfaceId ? ` (ID: ${selectedInterfaceId})` : ''}`}
      >
        {selectedInterfaceId && (
          <EditInterfaceDrawerContents
            interfaceId={selectedInterfaceId}
            linodeId={linodeId}
            onClose={() => setIsEditDrawerOpen(false)}
            regionId={regionId}
          />
        )}
      </Drawer>
      <Drawer
        onClose={() => setIsSettingsDrawerOpen(false)}
        open={isSettingsDrawerOpen}
        title="Interface Settings"
      >
        <InterfaceSettingsForm
          linodeId={linodeId}
          onClose={() => setIsSettingsDrawerOpen(false)}
        />
      </Drawer>
    </Box>
  );
};
