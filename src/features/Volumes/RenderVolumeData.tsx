import * as React from 'react';
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
    linodeLabel: string
  ) => void;
  handleDelete: (volumeId: number, volumeLabel: string) => void;
}

const RenderData: React.StatelessComponent<
  { data: Linode.Volume[] } & RenderVolumeDataProps
> = props => {
  const {
    data,
    isVolumesLanding,
    handleAttach,
    handleDelete,
    handleDetach,
    openForClone,
    openForConfig,
    openForEdit,
    openForResize
  } = props;

  return (
    <>
      {data.map((volume, idx: number) => (
        <VolumeTableRow
          key={`volume-table-row-${idx}`}
          volume={volume}
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

export const isVolumeUpdating = (e?: Linode.Event) => {
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
