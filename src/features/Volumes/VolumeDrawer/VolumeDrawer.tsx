import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import Drawer from 'src/components/Drawer';
import { close, openForConfig } from 'src/store/reducers/volumeDrawer';
import AttachVolumeToLinodeForm from './AttachVolumeToLinodeForm';
import CloneVolumeForm from './CloneVolumeForm';
import CreateVolumeForLinodeForm from './CreateVolumeForLinodeForm';
import CreateVolumeForm from './CreateVolumeForm';
import EditVolumeForm from './EditVolumeForm';
import ResizeVolumeForm from './ResizeVolumeForm';
import VolumeConfigForm from './VolumeConfigForm';

export const modes = {
  CLOSED: 'closed',
  CREATING: 'creating',
  CREATING_FOR_LINODE: 'creating_for_linode',
  RESIZING: 'resizing',
  CLONING: 'cloning',
  EDITING: 'editing',
  ATTACHING: 'attaching',
  VIEWING_CONFIG: 'viewing_config',
};

type CombinedProps = StateProps & DispatchProps

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
    } = this.props;

    return (
      <Drawer open={isOpen} title={drawerTitle} onClose={actions.closeDrawer}>
        {
          mode === modes.CREATING &&
          <CreateVolumeForm onClose={actions.closeDrawer} onSuccess={actions.openForConfig} />
        }
        {
          mode === modes.EDITING && volumeId !== undefined && volumeLabel !== undefined && volumeTags !== undefined &&
          <EditVolumeForm
            volumeId={volumeId}
            volumeLabel={volumeLabel}
            onClose={actions.closeDrawer}
            volumeTags={volumeTags.map(v => ({ label: v, value: v }))}
          />
        }
        {
          mode === modes.RESIZING && volumeId !== undefined && volumeSize !== undefined &&
          <ResizeVolumeForm volumeId={volumeId} volumeSize={volumeSize} onClose={actions.closeDrawer} />
        }
        {
          mode === modes.CLONING && volumeId !== undefined
          && volumeLabel !== undefined
          && volumeRegion !== undefined
          && volumeSize !== undefined
          &&
          <CloneVolumeForm
            onClose={actions.closeDrawer}
            volumeId={volumeId}
            volumeLabel={volumeLabel}
            volumeRegion={volumeRegion}
            volumeSize={volumeSize}
          />
        }
        {
          mode === modes.CREATING_FOR_LINODE
          && linodeId !== undefined
          && linodeLabel !== undefined
          && linodeRegion !== undefined
          &&
          <CreateVolumeForLinodeForm
            linodeId={linodeId}
            linodeLabel={linodeLabel}
            linodeRegion={linodeRegion}
            onSuccess={actions.openForConfig}
            onClose={actions.closeDrawer}
          />
        }
        {
          mode === modes.ATTACHING
          && linodeId !== undefined
          && linodeRegion !== undefined
          && linodeLabel !== undefined
          &&
          <AttachVolumeToLinodeForm
            linodeId={linodeId}
            linodeRegion={linodeRegion}
            linodeLabel={linodeLabel}
            onClose={actions.closeDrawer}
          />
        }
        {
          mode === modes.VIEWING_CONFIG
          && volumeLabel !== undefined
          && volumePath !== undefined
          &&
          <VolumeConfigForm
            volumeLabel={volumeLabel}
            volumePath={volumePath}
            message={message}
            onClose={actions.closeDrawer}
          />
        }
      </Drawer>
    );
  }
}

interface DispatchProps {
  actions: {
    closeDrawer: () => void;
    openForConfig: (volumeLabel: string, volumePath: string, message?: string) => void;
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch) => ({
  actions: {
    closeDrawer: () => dispatch(close()),
    openForConfig: (volumeLabel: string, volumePath: string, message?: string) => dispatch(openForConfig(volumeLabel, volumePath, message)),
  },
});

interface StateProps {
  drawerTitle: string;
  isOpen: boolean,
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

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state) => {
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
  }
};

const titleFromState = (state: ApplicationState['volumeDrawer']) => {
  const { mode, volumeLabel, linodeLabel } = state;

  switch (mode) {
    case modes.CREATING:
    return `Create a Volume`;

    case modes.CREATING_FOR_LINODE:
      return `Create a volume for ${linodeLabel}`

    case modes.RESIZING:
      return `Resize volume ${volumeLabel}`;

    case modes.CLONING:
      return `Clone volume ${volumeLabel}`;

    case modes.EDITING:
      return `Edit volume ${volumeLabel}`;

    case modes.ATTACHING:
      return `Attach volume to ${linodeLabel}`;

    case modes.VIEWING_CONFIG:
      return `Volume Configuration`;

    default:
      return '';
  }
};

const connected = connect(mapStateToProps, mapDispatchToProps);

export default connected(VolumeDrawer);
