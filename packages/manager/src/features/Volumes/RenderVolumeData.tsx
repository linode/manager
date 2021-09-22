import { Event } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { ExtendedVolume } from './types';
import VolumeTableRow from './VolumeTableRow';

export interface RenderVolumeDataProps {
  isVolumesLanding: boolean;
  openForEdit: (
    volumeId: number,
    volumeLabel: string,
    volumeTags: string[]
  ) => void;
  openForResize: (
    volumeId: number,
    volumeSize: number,
    volumeLabel: string
  ) => void;
  openForClone: (
    volumeId: number,
    volumeLabel: string,
    volumeSize: number,
    volumeRegion: string
  ) => void;
  openForConfig: (volumeLabel: string, volumePath: string) => void;
  handleAttach: (volumeId: number, label: string, regionID: string) => void;
  handleDetach: (
    volumeId: number,
    volumeLabel: string,
    linodeLabel: string,
    poweredOff: boolean
  ) => void;
  handleDelete: (volumeId: number, volumeLabel: string) => void;
}

const RenderData: React.FC<
  {
    data: ExtendedVolume[];
  } & RenderVolumeDataProps
> = (props) => {
  const {
    data,
    isVolumesLanding,
    handleAttach,
    handleDelete,
    handleDetach,
    openForClone,
    openForConfig,
    openForEdit,
    openForResize,
  } = props;

  return (
    /* eslint-disable-next-line */
    <>
      {data.map((volume, idx: number) => (
        <VolumeTableRow
          key={`volume-table-row-${idx}`}
          volume={volume}
          id={volume.id}
          label={volume.label}
          region={volume.region}
          size={volume.size}
          status={volume.status}
          tags={volume.tags}
          created={volume.created}
          updated={volume.updated}
          filesystem_path={volume.filesystem_path}
          hardware_type={volume.hardware_type}
          linode_id={volume.linode_id}
          isVolumesLanding={isVolumesLanding}
          isUpdating={isVolumeUpdating(volume.recentEvent)}
          handleAttach={handleAttach}
          handleDelete={handleDelete}
          handleDetach={handleDetach}
          openForEdit={openForEdit}
          openForClone={openForClone}
          openForConfig={openForConfig}
          openForResize={openForResize}
        />
      ))}
    </>
  );
};

export const isVolumeUpdating = (e?: Event) => {
  // Make Typescript happy, since this function can otherwise technically return undefined
  if (!e) {
    return false;
  }
  return (
    e &&
    ['volume_attach', 'volume_detach', 'volume_create'].includes(e.action) &&
    ['scheduled', 'started'].includes(e.status)
  );
};

export default RenderData;
