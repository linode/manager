import { Image } from '@linode/api-v4/lib/images';
import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { PaginationProps } from 'src/components/Paginate';
import TagDrawer from 'src/components/TagCell/TagDrawer';
import LinodeRow from './LinodeRow/LinodeRow';
import LinodeRow_CMR from './LinodeRow/LinodeRow_CMR';

import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import useFlags from 'src/hooks/useFlags';
import { LinodeWithMaintenanceAndDisplayStatus } from 'src/store/linodes/types';

interface Props {
  data: LinodeWithMaintenanceAndDisplayStatus[];
  images: Image[];
  showHead?: boolean;
  openDeleteDialog: (linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
}

interface TagDrawerProps {
  label: string;
  tags: string[];
  open: boolean;
  linodeID: number;
}

type CombinedProps = Props & PaginationProps;

export const ListView: React.FC<CombinedProps> = props => {
  const { data, openDeleteDialog, openPowerActionDialog } = props;
  const [tagDrawer, setTagDrawer] = React.useState<TagDrawerProps>({
    open: false,
    tags: [],
    label: '',
    linodeID: 0
  });

  const closeTagDrawer = () => {
    setTagDrawer({ ...tagDrawer, open: false });
  };

  const openTagDrawer = (
    linodeID: number,
    linodeLabel: string,
    tags: string[]
  ) => {
    setTagDrawer({
      open: true,
      label: linodeLabel,
      tags,
      linodeID
    });
  };

  const flags = useFlags();

  const Row = flags.cmr ? LinodeRow_CMR : LinodeRow;

  return (
    // eslint-disable-next-line
    <>
      {data.map((linode, idx: number) => (
        <Row
          backups={linode.backups}
          id={linode.id}
          ipv4={linode.ipv4}
          maintenanceStartTime={
            linode.maintenance ? linode.maintenance.when : ''
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
          type={linode.type}
          image={linode.image}
          key={`linode-row-${idx}`}
          openTagDrawer={openTagDrawer}
          openDeleteDialog={openDeleteDialog}
          openPowerActionDialog={openPowerActionDialog}
        />
      ))}
      <TagDrawer
        entityLabel={tagDrawer.label}
        open={tagDrawer.open}
        tags={tagDrawer.tags}
        addTag={() => null}
        deleteTag={() => null}
        onClose={closeTagDrawer}
      />
    </>
  );
};

export default ListView;
