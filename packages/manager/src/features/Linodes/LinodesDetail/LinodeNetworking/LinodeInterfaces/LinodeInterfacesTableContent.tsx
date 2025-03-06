import React from 'react';

import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { useLinodeInterfacesQuery } from 'src/queries/linodes/interfaces';

import { LinodeInterfaceTableRow } from './LinodeInterfaceTableRow';

interface Props {
  linodeId: number;
}

export const LinodeInterfacesTableContent = ({ linodeId }: Props) => {
  const { data, error, isPending } = useLinodeInterfacesQuery(linodeId);

  if (isPending) {
    return <TableRowLoading columns={8} rows={1} />;
  }

  if (error) {
    return <TableRowError colSpan={8} message={error?.[0].reason} />;
  }

  if (data.interfaces.length === 0) {
    return (
      <TableRowEmpty
        colSpan={8}
        message="No Network Interfaces exist on this Linode."
      />
    );
  }

  return data.interfaces.map((networkInterface) => (
    <LinodeInterfaceTableRow
      key={networkInterface.id}
      linodeId={linodeId}
      {...networkInterface}
    />
  ));
};
