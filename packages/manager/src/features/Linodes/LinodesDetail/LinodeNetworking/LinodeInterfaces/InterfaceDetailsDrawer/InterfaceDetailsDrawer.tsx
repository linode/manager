import { useLinodeInterfaceQuery } from '@linode/queries';
import { Drawer } from '@linode/ui';
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
      NotFoundComponent={NotFound}
      error={error?.[0].reason}
      isFetching={isLoading}
      onClose={onClose}
      open={open}
      title="Network Interface Details"
    >
      {linodeInterface && <InterfaceDetailsContent {...linodeInterface} />}
    </Drawer>
  );
};
