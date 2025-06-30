import { useLinodeInterfaceQuery } from '@linode/queries';
import { Box, Button, Drawer } from '@linode/ui';
import { useLocation } from '@tanstack/react-router';
import React from 'react';

import { InterfaceDetailsContent } from './InterfaceDetailsContent';

interface Props {
  interfaceId: number | undefined;
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const InterfaceDetailsDrawer = (props: Props) => {
  const location = useLocation();
  const interfaceIdFromLocation = +location.pathname.split('/').slice(-1);

  const { interfaceId: id, linodeId, onClose, open } = props;
  const interfaceId = id ?? interfaceIdFromLocation;

  const {
    data: linodeInterface,
    error,
    isLoading,
  } = useLinodeInterfaceQuery(linodeId, interfaceId, open);

  return (
    <Drawer
      error={error?.[0].reason}
      isFetching={isLoading}
      onClose={onClose}
      open={open}
      title={`Network Interface Details${
        interfaceId ? ` (ID: ${interfaceId})` : ''
      }`}
    >
      {linodeInterface && <InterfaceDetailsContent {...linodeInterface} />}
      <Box marginTop={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>Close</Button>
      </Box>
    </Drawer>
  );
};
