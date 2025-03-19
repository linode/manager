import { useLinodeInterfaceQuery } from '@linode/queries';
import { Box, Button, Drawer } from '@linode/ui';
import React from 'react';

import { NotFound } from 'src/components/NotFound';

import { InterfaceDetailsContent } from './InterfaceDetailsContent';

interface Props {
  interfaceId: number | undefined;
  linodeId: number;
  onClose: () => void;
  open: boolean;
}

export const InterfaceDetailsDrawer = (props: Props) => {
  const { interfaceId, linodeId, onClose, open } = props;

  const { data: linodeInterface, error, isLoading } = useLinodeInterfaceQuery(
    linodeId,
    interfaceId ?? -1
  ); // todo: fix the query thing

  return (
    <Drawer
      title={`Network Interface Details${
        interfaceId ? `: #${interfaceId}` : ''
      }`}
      NotFoundComponent={NotFound}
      error={error?.[0].reason}
      isFetching={isLoading}
      onClose={onClose}
      open={open}
    >
      {linodeInterface && <InterfaceDetailsContent {...linodeInterface} />}
      <Box marginTop={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose}>Close</Button>
      </Box>
    </Drawer>
  );
};
