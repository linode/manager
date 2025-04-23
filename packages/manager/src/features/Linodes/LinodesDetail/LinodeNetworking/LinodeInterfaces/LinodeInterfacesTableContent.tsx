import { useLinodeInterfacesQuery } from '@linode/queries';
import React from 'react';

import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

import { LinodeInterfaceTableRow } from './LinodeInterfaceTableRow';

import type { InterfaceActionHandlers } from './LinodeInterfaceActionMenu';

interface Props {
  handlers: InterfaceActionHandlers;
  linodeId: number;
}

export const LinodeInterfacesTableContent = ({ handlers, linodeId }: Props) => {
  const { data, error, isPending } = useLinodeInterfacesQuery(linodeId);

  const cols = 9;

  if (isPending) {
    return <TableRowLoading columns={cols} rows={1} />;
  }

  if (error) {
    return <TableRowError colSpan={cols} message={error?.[0].reason} />;
  }

  if (data.interfaces.length === 0) {
    return (
      <TableRowEmpty
        colSpan={cols}
        message="No Network Interfaces exist on this Linode."
      />
    );
  }

  return data.interfaces.map((networkInterface) => (
    <LinodeInterfaceTableRow
      handlers={handlers}
      key={networkInterface.id}
      linodeId={linodeId}
      {...networkInterface}
    />
  ));
};
