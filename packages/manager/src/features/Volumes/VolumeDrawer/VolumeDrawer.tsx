import { Grant } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import Drawer from 'src/components/Drawer';
import withProfile, { ProfileProps } from 'src/components/withProfile';
import { getGrants } from 'src/features/Profile/permissionsHelpers';
import { ApplicationState } from 'src/store';
import { MapState } from 'src/store/types';
import {
  close,
  openForConfig,
  viewResizeInstructions,
} from 'src/store/volumeForm';
import AttachVolumeToLinodeForm from './AttachVolumeToLinodeForm';
import CloneVolumeForm from './CloneVolumeForm';
import CreateVolumeForLinodeForm from './CreateVolumeForLinodeForm';
import EditVolumeForm from './EditVolumeForm';
import { modes } from './modes';
import ResizeVolumeForm from './ResizeVolumeForm';
import ResizeVolumesInstruction from './ResizeVolumesInstruction';
import VolumeConfigForm from './VolumeConfigForm';

type CombinedProps = StateProps & DispatchProps & ProfileProps;

class VolumeDrawer extends React.PureComponent<CombinedProps> {
  render() {
    const {
      actions,
      drawerTitle,
      isOpen,
      linodeId,
      linodeLabel,
      linodeRegion,
      mode,
      volumeId,
      volumeLabel,
      volumeRegion,
      volumeSize,
      volumeTags,
      volumePath,
      message,
      profile,
      grants,
    } = this.props;

    const volumesPermissions = getGrants(grants.data, 'volume');

    const volumePermissions = volumesPermissions.find(
      (v: Grant) => v.id === volumeId
    );
    const readOnly =
      Boolean(profile.data?.restricted) &&
      volumePermissions &&
      volumePermissions.permissions === 'read_only';

    return (
      <Drawer open={isOpen} title={drawerTitle} onClose={actions.closeDrawer}>
        {mode === modes.EDITING &&
          volumeId !== undefined &&
          volumeLabel !== undefined &&
          volumeTags !== undefined && (
            <EditVolumeForm
              volumeId={volumeId}
              volumeLabel={volumeLabel}
              onClose={actions.closeDrawer}
              volumeTags={volumeTags.map((v) => ({ label: v, value: v }))}
              readOnly={readOnly}
            />
          )}
        {mode === modes.RESIZING &&
          volumeId !== undefined &&
          volumeSize !== undefined &&
          volumeLabel !== undefined && (
            <ResizeVolumeForm
              volumeId={volumeId}
              volumeSize={volumeSize}
              onClose={actions.closeDrawer}
              volumeLabel={volumeLabel}
              onSuccess={actions.openForResizeInstructions}
              readOnly={readOnly}
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
              linode_id={linodeId}
              linodeLabel={linodeLabel}
              linodeRegion={linodeRegion}
              onSuccess={actions.openForConfig}
              onClose={actions.closeDrawer}
            />
          )}
        {mode === modes.ATTACHING &&
          linodeId !== undefined &&
          linodeRegion !== undefined &&
          linodeLabel !== undefined && (
            <AttachVolumeToLinodeForm
              linodeId={linodeId}
              linodeRegion={linodeRegion}
              linodeLabel={linodeLabel}
              onClose={actions.closeDrawer}
            />
          )}
        {mode === modes.VIEWING_CONFIG &&
          volumeLabel !== undefined &&
          volumePath !== undefined && (
            <VolumeConfigForm
              volumeLabel={volumeLabel}
              volumePath={volumePath}
              message={message}
              onClose={actions.closeDrawer}
            />
          )}
        {mode === modes.VIEW_RESIZE_INSTRUCTIONS &&
          volumeLabel !== undefined && (
            <ResizeVolumesInstruction
              volumeLabel={volumeLabel}
              message={message}
              onClose={actions.closeDrawer}
            />
          )}
      </Drawer>
    );
  }
}

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
      dispatch(viewResizeInstructions({ volumeLabel, message })),
  },
});

interface StateProps {
  drawerTitle: string;
  isOpen: boolean;
  mode: string;
  volumeId?: number;
  volumeLabel?: string;
  volumeRegion?: string;
  volumeSize?: number;
  volumeTags?: string[];
  volumePath?: string;
  linodeId?: number;
  linodeLabel?: string;
  linodeRegion?: string;
  message?: string;
}

const mapStateToProps: MapState<StateProps, {}> = (state) => {
  const {
    linodeId,
    linodeLabel,
    linodeRegion,
    mode,
    volumeId,
    volumeLabel,
    volumeRegion,
    volumeSize,
    volumeTags,
    volumePath,
    message,
  } = state.volumeDrawer;

  return {
    drawerTitle: titleFromState(state.volumeDrawer),
    isOpen: mode !== modes.CLOSED,
    linodeId,
    linodeLabel,
    linodeRegion,
    mode,
    volumeId,
    volumeLabel,
    volumeRegion,
    volumeSize,
    volumeTags,
    volumePath,
    message,
  };
};

const titleFromState = (state: ApplicationState['volumeDrawer']) => {
  const { mode, linodeLabel } = state;

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

export default compose(connected, withProfile)(VolumeDrawer);
