import * as React from 'react';
import { PaginationProps } from 'src/components/Paginate';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import LinodeRow from './LinodeRow/LinodeRow';

interface Props {
  data: Linode.Linode[];
  images: Linode.Image[];
  showHead?: boolean;
  openConfigDrawer: (
    c: Linode.Config[],
    action: LinodeConfigSelectionDrawerCallback
  ) => void;
  toggleConfirmation: (
    bootOption: Linode.BootAction,
    linodeId: number,
    linodeLabel: string
  ) => void;
}

type CombinedProps = Props & PaginationProps;

export const ListView: React.StatelessComponent<CombinedProps> = props => {
  const { data, openConfigDrawer, toggleConfirmation } = props;
  return (
    <>
      {data.map((linode, idx: number) => (
        <LinodeRow
          backups={linode.backups}
          id={linode.id}
          ipv4={linode.ipv4}
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
          openConfigDrawer={openConfigDrawer}
          toggleConfirmation={toggleConfirmation}
        />
      ))}
    </>
  );
};

export default ListView;
