import { Grant } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { MapDispatchToProps, connect } from 'react-redux';

import { Drawer } from 'src/components/Drawer';
import {
  WithProfileProps,
  withProfile,
} from 'src/containers/profile.container';
import { useFlags } from 'src/hooks/useFlags';
import { ApplicationState } from 'src/store';
import { MapState } from 'src/store/types';
import {
  close,
  openForConfig,
  viewResizeInstructions,
} from 'src/store/volumeForm';

import AttachVolumeToLinodeForm from './AttachVolumeToLinodeForm';
import { CloneVolumeForm } from './CloneVolumeForm';
import CreateVolumeForLinodeForm from './CreateVolumeForLinodeForm';
import { EditVolumeForm } from './EditVolumeForm';
import { ResizeVolumeForm } from './ResizeVolumeForm';
import ResizeVolumesInstruction from './ResizeVolumesInstruction';
import VolumeConfigForm from './VolumeConfigForm';
import { modes } from './modes';

type CombinedProps = StateProps & DispatchProps & WithProfileProps;

const VolumeDrawer = (props: CombinedProps) => {
  const {
    actions,
    drawerTitle,
    grants,
    isOpen,
    linodeId,
    linodeLabel,
    linodeRegion,
    message,
    mode,
    profile,
    volumeId,
    volumeLabel,
    volumePath,
    volumeRegion,
    volumeSize,
    volumeTags,
  } = props;

  const flags = useFlags();
  const volumesPermissions = grants.data?.volume;
  const volumePermissions = volumesPermissions?.find(
    (v: Grant) => v.id === volumeId
  );
  const readOnly =
    Boolean(profile.data?.restricted) &&
    volumePermissions &&
    volumePermissions.permissions === 'read_only';

  return (
    <Drawer onClose={actions.closeDrawer} open={isOpen} title={drawerTitle}>
      {mode === modes.EDITING &&
        volumeId !== undefined &&
        volumeLabel !== undefined &&
        volumeTags !== undefined && (
          <EditVolumeForm
            onClose={actions.closeDrawer}
            readOnly={readOnly}
            volumeId={volumeId}
            volumeLabel={volumeLabel}
            volumeTags={volumeTags.map((v) => ({ label: v, value: v }))}
          />
        )}
      {mode === modes.RESIZING &&
        volumeId !== undefined &&
        volumeSize !== undefined &&
        volumeLabel !== undefined && (
          <ResizeVolumeForm
            flags={flags}
            onClose={actions.closeDrawer}
            onSuccess={actions.openForResizeInstructions}
            readOnly={readOnly}
            regionId={linodeRegion}
            volumeId={volumeId}
            volumeLabel={volumeLabel}
            volumeSize={volumeSize}
          />
        )}
      {mode === modes.CLONING &&
        volumeId !== undefined &&
        volumeLabel !== undefined &&
        volumeRegion !== undefined &&
        volumeSize !== undefined && (
          <CloneVolumeForm
            onClose={actions.closeDrawer}
            volumeId={volumeId}
            volumeLabel={volumeLabel}
            volumeRegion={volumeRegion}
            volumeSize={volumeSize}
          />
        )}
      {mode === modes.CREATING_FOR_LINODE &&
        linodeId !== undefined &&
        linodeLabel !== undefined &&
        linodeRegion !== undefined && (
          <CreateVolumeForLinodeForm
            flags={flags}
            linode_id={linodeId}
            linodeLabel={linodeLabel}
            linodeRegion={linodeRegion}
            onClose={actions.closeDrawer}
            onSuccess={actions.openForConfig}
          />
        )}
      {mode === modes.ATTACHING &&
        linodeId !== undefined &&
        linodeRegion !== undefined &&
        linodeLabel !== undefined && (
          <AttachVolumeToLinodeForm
            linodeId={linodeId}
            linodeLabel={linodeLabel}
            linodeRegion={linodeRegion}
            onClose={actions.closeDrawer}
          />
        )}
      {mode === modes.VIEWING_CONFIG &&
        volumeLabel !== undefined &&
        volumePath !== undefined && (
          <VolumeConfigForm
            message={message}
            onClose={actions.closeDrawer}
            volumeLabel={volumeLabel}
            volumePath={volumePath}
          />
        )}
      {mode === modes.VIEW_RESIZE_INSTRUCTIONS && volumeLabel !== undefined && (
        <ResizeVolumesInstruction
          message={message}
          onClose={actions.closeDrawer}
          volumeLabel={volumeLabel}
        />
      )}
    </Drawer>
  );
};

interface DispatchProps {
  actions: {
    closeDrawer: () => void;
    openForConfig: (
      volumeLabel: string,
      volumePath: string,
      message?: string
    ) => void;
    openForResizeInstructions: (volumeLabel: string, message?: string) => void;
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch
) => ({
  actions: {
    closeDrawer: () => dispatch(close()),
    openForConfig: (
      volumeLabel: string,
      volumePath: string,
      message?: string
    ) => dispatch(openForConfig(volumeLabel, volumePath, message)),
    openForResizeInstructions: (volumeLabel: string, message?: string) =>
      dispatch(viewResizeInstructions({ message, volumeLabel })),
  },
});

interface StateProps {
  drawerTitle: string;
  isOpen: boolean;
  linodeId?: number;
  linodeLabel?: string;
  linodeRegion?: string;
  message?: string;
  mode: string;
  volumeId?: number;
  volumeLabel?: string;
  volumePath?: string;
  volumeRegion?: string;
  volumeSize?: number;
  volumeTags?: string[];
}

const mapStateToProps: MapState<StateProps, {}> = (state) => {
  const {
    linodeId,
    linodeLabel,
    linodeRegion,
    message,
    mode,
    volumeId,
    volumeLabel,
    volumePath,
    volumeRegion,
    volumeSize,
    volumeTags,
  } = state.volumeDrawer;

  return {
    drawerTitle: titleFromState(state.volumeDrawer),
    isOpen: mode !== modes.CLOSED,
    linodeId,
    linodeLabel,
    linodeRegion,
    message,
    mode,
    volumeId,
    volumeLabel,
    volumePath,
    volumeRegion,
    volumeSize,
    volumeTags,
  };
};

const titleFromState = (state: ApplicationState['volumeDrawer']) => {
  const { linodeLabel, mode } = state;

  switch (mode) {
    case modes.CREATING_FOR_LINODE:
      return `Create Volume for ${linodeLabel}`;

    case modes.RESIZING:
      return `Resize Volume`;

    case modes.CLONING:
      return `Clone Volume`;

    case modes.EDITING:
      return `Edit Volume`;

    case modes.ATTACHING:
      return `Attach Volume to ${linodeLabel}`;

    case modes.VIEWING_CONFIG:
      return `Volume Configuration`;

    case modes.VIEW_RESIZE_INSTRUCTIONS:
      return `Resizing Instructions`;

    default:
      return '';
  }
};

const connected = connect(mapStateToProps, mapDispatchToProps);

const VolumeDrawerWithHOCs = withProfile(connected(VolumeDrawer));

export default VolumeDrawerWithHOCs;
