import * as React from 'react';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { RenderLinodesProps } from './DisplayLinodes';
import { LinodeRow } from './LinodeRow/LinodeRow';

export const ListView: React.FC<RenderLinodesProps> = (props) => {
  const { data, openDialog, openPowerActionDialog } = props;

  // This won't happen in the normal Linodes Landing context (a custom empty
  // state is shown higher up in the tree). This is specifically for the case of
  // VLAN Details, where we want to show the table even if there's nothing attached.
  if (data.length === 0) {
    return <TableRowEmpty colSpan={12} />;
  }

  return (
    // eslint-disable-next-line
    <>
      {/* @todo: fix this "any" typing once https://github.com/linode/manager/pull/6999 is merged. */}
      {data.map((linode, idx: number) => (
        <LinodeRow
          backups={linode.backups}
          id={linode.id}
          ipv4={linode.ipv4}
          ipv6={linode.ipv6 || ''}
          label={linode.label}
          region={linode.region}
          status={linode.status}
          tags={linode.tags}
          type={linode.type}
          image={linode.image}
          key={`linode-row-${idx}`}
          alerts={linode.alerts}
          created={linode.created}
          group={linode.group}
          updated={linode.updated}
          hypervisor={linode.hypervisor}
          specs={linode.specs}
          watchdog_enabled={linode.watchdog_enabled}
          handlers={{
            onOpenDeleteDialog: () =>
              openDialog('delete', linode.id, linode.label),
            onOpenMigrateDialog: () =>
              openDialog('migrate', linode.id, linode.label),
            onOpenRebuildDialog: () =>
              openDialog('rebuild', linode.id, linode.label),
            onOpenRescueDialog: () =>
              openDialog('rescue', linode.id, linode.label),
            onOpenResizeDialog: () =>
              openDialog('resize', linode.id, linode.label),
            onOpenPowerDialog: (action) =>
              openPowerActionDialog(action, linode.id, linode.label, []),
          }}
        />
      ))}
    </>
  );
};

export default ListView;
