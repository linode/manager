import { Image } from '@linode/api-v4/lib/images';
import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { PaginationProps } from 'src/components/Paginate';
import TagDrawer, { TagDrawerProps } from 'src/components/TagCell/TagDrawer';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/linodes/types';
import useFlags from 'src/hooks/useFlags';
import useLinodes from 'src/hooks/useLinodes';
import { LinodeWithMaintenanceAndDisplayStatus } from 'src/store/linodes/types';
import formatDate from 'src/utilities/formatDate';
import LinodeRow from './LinodeRow/LinodeRow';
import LinodeRow_CMR from './LinodeRow/LinodeRow_CMR';

interface Props {
  data: LinodeWithMaintenanceAndDisplayStatus[];
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

type CombinedProps = Props & PaginationProps;

export const ListView: React.FC<CombinedProps> = props => {
  const { data, openDialog, openPowerActionDialog } = props;
  const [tagDrawer, setTagDrawer] = React.useState<TagDrawerProps>({
    open: false,
    tags: [],
    label: '',
    linodeID: 0
  });

  const { updateLinode } = useLinodes();

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

  const addTag = (linodeID: number, newTag: string) => {
    const _tags = [...tagDrawer.tags, newTag];
    return updateLinode({ linodeId: linodeID, tags: _tags }).then(_ => {
      setTagDrawer({ ...tagDrawer, tags: _tags });
    });
  };

  const deleteTag = (linodeId: number, tagToDelete: string) => {
    const _tags = tagDrawer.tags.filter(thisTag => thisTag !== tagToDelete);
    return updateLinode({ linodeId, tags: _tags }).then(_ => {
      setTagDrawer({ ...tagDrawer, tags: _tags });
    });
  };

  // @todo delete after CMR
  const openDeleteDialog = (linodeID: number, linodeLabel: string) => {
    props.openDialog('delete', linodeID, linodeLabel);
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
          type={linode.type}
          image={linode.image}
          key={`linode-row-${idx}`}
          openTagDrawer={openTagDrawer}
          openDialog={openDialog}
          // @todo delete after CMR
          openDeleteDialog={openDeleteDialog}
          openPowerActionDialog={openPowerActionDialog}
        />
      ))}
      <TagDrawer
        entityLabel={tagDrawer.label}
        open={tagDrawer.open}
        tags={tagDrawer.tags}
        addTag={(newTag: string) => addTag(tagDrawer.linodeID, newTag)}
        deleteTag={(tag: string) => deleteTag(tagDrawer.linodeID, tag)}
        onClose={closeTagDrawer}
      />
    </>
  );
};

export default ListView;
