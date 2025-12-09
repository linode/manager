import * as React from 'react';

import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';

import { LinodeRow } from './LinodeRow/LinodeRow';

import type { RenderLinodesProps } from './DisplayLinodes';

export const ListView = (props: RenderLinodesProps) => {
  const { data, openDialog, openPowerActionDialog } = props;

  // This won't happen in the normal Linodes Landing context (a custom empty
  // state is shown higher up in the tree). This is specifically for the case of
  // VLAN Details, where we want to show the table even if there's nothing attached.
  if (data.length === 0) {
    return <TableRowEmpty colSpan={12} />;
  }

  return (
    <>
      {data.map((linode, idx: number) => (
        <LinodeRow
          handlers={{
            onOpenDeleteDialog: () =>
              openDialog('delete', linode.id, linode.label),
            onOpenMigrateDialog: () =>
              openDialog('migrate', linode.id, linode.label),
            onOpenPowerDialog: (action) =>
              openPowerActionDialog(action, linode.id, linode.label, []),
            onOpenRebuildDialog: () =>
              openDialog('rebuild', linode.id, linode.label),
            onOpenRescueDialog: () =>
              openDialog('rescue', linode.id, linode.label),
            onOpenResizeDialog: () =>
              openDialog('resize', linode.id, linode.label),
          }}
          key={`linode-row-${idx}`}
          {...linode}
        />
      ))}
    </>
  );
};
