import * as React from 'react';
import { PaginationProps } from 'src/components/Paginate';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import LinodeRow from './LinodeRow/LinodeRow';

interface Props {
  data: Linode.Linode[];
  images: Linode.Image[];
  showHead?: boolean;
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction, linodeId: number, linodeLabel: string) => void;
}

type CombinedProps =
  & Props
  & PaginationProps;

export const ListView: React.StatelessComponent<CombinedProps> = (props) => {
  const { data, openConfigDrawer, toggleConfirmation } = props;
  return (
    <>
      {
        data.map(linode =>
          <LinodeRow
            key={linode.id}
            linodeId={linode.id}
            linodeType={linode.type}
            linodeStatus={linode.status}
            linodeIpv4={linode.ipv4}
            linodeIpv6={linode.ipv6}
            linodeRegion={linode.region}
            linodeNotification={linode.notification}
            linodeLabel={linode.label}
            linodeBackups={linode.backups}
            linodeTags={linode.tags}
            linodeRecentEvent={linode.recentEvent}
            openConfigDrawer={openConfigDrawer}
            toggleConfirmation={toggleConfirmation}
            mostRecentBackup={linode.mostRecentBackup}
          />,
        )
      }
    </>
  );
};

export default ListView;
