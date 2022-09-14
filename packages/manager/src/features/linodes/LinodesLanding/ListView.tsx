import { Image } from '@linode/api-v4/lib/images';
import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { PaginationProps } from 'src/components/Paginate';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/linodes/types';
import { notificationContext as _notificationContext } from 'src/features/NotificationCenter/NotificationContext';
import { LinodeWithMaintenanceAndDisplayStatus } from 'src/store/linodes/types';
import { ExtendedType } from 'src/store/linodeType/linodeType.reducer';
import formatDate from 'src/utilities/formatDate';
import LinodeRow from './LinodeRow';

interface Props {
  data: ExtendedLinodeWithPlan[];
  images: Image[];
  showHead?: boolean;
  openDialog: (type: DialogType, linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
}

export interface ExtendedLinodeWithPlan
  extends LinodeWithMaintenanceAndDisplayStatus {
  _type?: ExtendedType;
}

type CombinedProps = Props & PaginationProps;

export const ListView: React.FC<CombinedProps> = (props) => {
  const { data, openDialog, openPowerActionDialog } = props;

  const notificationContext = React.useContext(_notificationContext);

  // This won't happen in the normal Linodes Landing context (a custom empty
  // state is shown higher up in the tree). This is specifically for the case of
  // VLAN Details, where we want to show the table even if there's nothing attached.
  if (data.length === 0) {
    return <TableRowEmptyState colSpan={12} />;
  }

  return (
    // eslint-disable-next-line
    <>
      {/* @todo: fix this "any" typing once https://github.com/linode/manager/pull/6999 is merged. */}
      {data.map((linode: ExtendedLinodeWithPlan, idx: number) => (
        <LinodeRow
          backups={linode.backups}
          id={linode.id}
          ipv4={linode.ipv4}
          maintenanceStartTime={
            linode.maintenance?.when ? formatDate(linode.maintenance.when) : ''
          }
          ipv6={linode.ipv6 || ''}
          label={linode.label}
          region={linode.region}
          status={linode.status}
          displayStatus={linode.displayStatus || ''}
          tags={linode.tags}
          mostRecentBackup={linode.backups.last_successful}
          disk={linode.specs.disk}
          vcpus={linode.specs.vcpus}
          memory={linode.specs.memory}
          type={linode._type}
          image={linode.image}
          key={`linode-row-${idx}`}
          openDialog={openDialog}
          openNotificationMenu={notificationContext.openMenu}
          openPowerActionDialog={openPowerActionDialog}
        />
      ))}
    </>
  );
};

export default ListView;
