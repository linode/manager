import * as React from 'react';
import { PaginationProps } from 'src/components/Paginate';
import LinodeRow from './LinodeRow/LinodeRow';

import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';

interface Props {
  data: LinodeWithMaintenance[];
  images: Linode.Image[];
  showHead?: boolean;
  openDeleteDialog: (linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Linode.Config[]
  ) => void;
}

type CombinedProps = Props & PaginationProps;

export const ListView: React.StatelessComponent<CombinedProps> = props => {
  const { data, openDeleteDialog, openPowerActionDialog } = props;
  return (
    <>
      {data.map((linode, idx: number) => (
        <LinodeRow
          backups={linode.backups}
          id={linode.id}
          ipv4={linode.ipv4}
          maintenanceStartTime={
            linode.maintenance ? linode.maintenance.when : ''
          }
          ipv6={linode.ipv6}
          label={linode.label}
          region={linode.region}
          status={linode.status}
          tags={linode.tags}
          mostRecentBackup={linode.mostRecentBackup}
          disk={linode.specs.disk}
          vcpus={linode.specs.vcpus}
          memory={linode.specs.memory}
          type={linode.type}
          image={linode.image}
          key={`linode-row-${idx}`}
          openDeleteDialog={openDeleteDialog}
          openPowerActionDialog={openPowerActionDialog}
        />
      ))}
    </>
  );
};

export default ListView;
