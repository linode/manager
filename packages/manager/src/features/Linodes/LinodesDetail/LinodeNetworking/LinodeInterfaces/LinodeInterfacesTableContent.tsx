import { useLinodeInterfacesQuery } from '@linode/queries';
import React from 'react';

import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { useIsGpuRdmaPlanEnabled } from 'src/hooks/useIsGpuRdmaPlanEnabled';

import { LinodeInterfaceTableRow } from './LinodeInterfaceTableRow';

import type { InterfaceActionHandlers } from './LinodeInterfaceActionMenu';
import type { HiddenProps } from '@linode/ui';

interface Props {
  handlers: InterfaceActionHandlers;
  linodeId: number;
}

export const LinodeInterfacesTableContent = ({ handlers, linodeId }: Props) => {
  const { data, error, isPending } = useLinodeInterfacesQuery(linodeId);
  const { isGpuRdmaPlanEnabled } = useIsGpuRdmaPlanEnabled();

  const cols = 9;

  const hiddenCols: Record<number, HiddenProps> = {
    3: { smDown: true },
    5: { lgDown: true },
    7: { lgDown: true },
    8: { mdDown: true },
  };

  if (isPending) {
    return <TableRowLoading columns={cols} responsive={hiddenCols} rows={1} />;
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

  const interfaces = isGpuRdmaPlanEnabled
    ? data.interfaces
    : data.interfaces.filter((iface) => !iface.rdma_vpc);

  return interfaces.map((networkInterface) => (
    <LinodeInterfaceTableRow
      handlers={handlers}
      key={networkInterface.id}
      linodeId={linodeId}
      {...networkInterface}
    />
  ));
};
