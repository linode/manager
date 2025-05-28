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
          alerts={linode.alerts}
          backups={linode.backups}
          capabilities={linode.capabilities}
          created={linode.created}
          group={linode.group}
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
          hypervisor={linode.hypervisor}
          id={linode.id}
          image={linode.image}
          interface_generation={linode.interface_generation}
          ipv4={linode.ipv4}
          ipv6={linode.ipv6 || ''}
          key={`linode-row-${idx}`}
          label={linode.label}
          lke_cluster_id={linode.lke_cluster_id}
          maintenance={linode.maintenance}
          placement_group={linode.placement_group}
          region={linode.region}
          site_type={linode.site_type}
          specs={linode.specs}
          status={linode.status}
          tags={linode.tags}
          type={linode.type}
          updated={linode.updated}
          watchdog_enabled={linode.watchdog_enabled}
        />
      ))}
    </>
  );
};
