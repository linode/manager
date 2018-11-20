import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import Drawer from 'src/components/Drawer';
import { close } from 'src/store/reducers/volumeDrawer';
import CloneVolumeForm from './CloneVolumeForm';
import CreateVolumeForm from './CreateVolumeForm';
import RenameVolumeForm from './RenameVolumeForm';
import ResizeVolumeForm from './ResizeVolumeForm';

export const modes = {
  CLOSED: 'closed',
  CREATING: 'creating',
  CREATING_FOR_LINODE: 'creating_for_linode',
  RESIZING: 'resizing',
  CLONING: 'cloning',
  EDITING: 'editing',
};

const titleMap = {
  [modes.CLOSED]: '',
  [modes.CREATING]: 'Create a Volume',
  [modes.CREATING_FOR_LINODE]: 'Create a Volume',
  [modes.RESIZING]: 'Resize a Volume',
  [modes.CLONING]: 'Clone a Volume',
  [modes.EDITING]: 'Rename a Volume',
};

type CombinedProps = StateProps & DispatchProps

class VolumeDrawer extends React.PureComponent<CombinedProps> {
  render() {
    const {
      actions,
      isOpen,
      drawerTitle,
      mode,
      volumeId,
      volumeLabel,
      volumeRegion,
      volumeSize,
    } = this.props;

    return (
      <Drawer open={isOpen} title={drawerTitle} onClose={actions.closeDrawer}>
        {
          mode === modes.CREATING &&
          <CreateVolumeForm onClose={actions.closeDrawer} />
        }
        {
          mode === modes.EDITING && volumeId !== undefined && volumeLabel !== undefined &&
          <RenameVolumeForm volumeId={volumeId} volumeLabel={volumeLabel} onClose={actions.closeDrawer} />
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
      </Drawer>
    );
  }
}

interface StateProps {
  drawerTitle: string;
  isOpen: boolean,
  mode: string;
  volumeId?: number;
  volumeLabel?: string;
  volumeRegion?: string;
  volumeSize?: number;
}

interface DispatchProps {
  actions: {
    closeDrawer: () => void;
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch) => ({
  actions: {
    closeDrawer: () => dispatch(close())
  },
});

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (state) => {
  const { mode, volumeId, volumeLabel, volumeSize, volumeRegion } = state.volumeDrawer;
  const drawerTitle = titleMap[mode];

  return {
    drawerTitle,
    isOpen: mode !== modes.CLOSED,
    mode,
    volumeId,
    volumeLabel,
    volumeRegion,
    volumeSize,
  }
};

const connected = connect(mapStateToProps, mapDispatchToProps);

export default connected(VolumeDrawer);
