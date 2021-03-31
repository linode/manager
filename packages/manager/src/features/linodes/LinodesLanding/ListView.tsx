import { Image } from '@linode/api-v4/lib/images';
import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { PaginationProps } from 'src/components/Paginate';
import TableRowEmptyState_CMR from 'src/components/TableRowEmptyState/TableRowEmptyState_CMR';
import TagDrawer, { TagDrawerProps } from 'src/components/TagCell/TagDrawer';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/linodes/types';
import { notificationContext as _notificationContext } from 'src/features/NotificationCenter/NotificationContext';
import useLinodeActions from 'src/hooks/useLinodeActions';
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
  const [tagDrawer, setTagDrawer] = React.useState<TagDrawerProps>({
    open: false,
    tags: [],
    label: '',
    entityID: 0,
  });

  const { updateLinode } = useLinodeActions();

  const notificationContext = React.useContext(_notificationContext);

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
      entityID: linodeID,
    });
  };

  const addTag = (linodeID: number, newTag: string) => {
    const _tags = [...tagDrawer.tags, newTag];
    return updateLinode({ linodeId: linodeID, tags: _tags }).then((_) => {
      setTagDrawer({ ...tagDrawer, tags: _tags });
    });
  };

  const deleteTag = (linodeId: number, tagToDelete: string) => {
    const _tags = tagDrawer.tags.filter((thisTag) => thisTag !== tagToDelete);
    return updateLinode({ linodeId, tags: _tags }).then((_) => {
      setTagDrawer({ ...tagDrawer, tags: _tags });
    });
  };

  // This won't happen in the normal Linodes Landing context (a custom empty
  // state is shown higher up in the tree). This is specifically for the case of
  // VLAN Details, where we want to show the table even if there's nothing attached.
  if (data.length === 0) {
    return <TableRowEmptyState_CMR colSpan={12} />;
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
          openTagDrawer={openTagDrawer}
          openDialog={openDialog}
          openNotificationDrawer={notificationContext.openDrawer}
          openPowerActionDialog={openPowerActionDialog}
        />
      ))}
      <TagDrawer
        entityLabel={tagDrawer.label}
        open={tagDrawer.open}
        tags={tagDrawer.tags}
        addTag={(newTag: string) => addTag(tagDrawer.entityID, newTag)}
        deleteTag={(tag: string) => deleteTag(tagDrawer.entityID, tag)}
        onClose={closeTagDrawer}
      />
    </>
  );
};

export default ListView;
