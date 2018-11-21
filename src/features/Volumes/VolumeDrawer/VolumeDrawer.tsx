import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import Drawer from 'src/components/Drawer';
import { close } from 'src/store/reducers/volumeDrawer';
import CloneVolumeForm from './CloneVolumeForm';
import CreateVolumeForLinodeForm from './CreateVolumeForLinodeForm';
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
  [modes.CLOSED]: (volumeLabel: string) => '',
  [modes.CREATING]: (volumeLabel: string) => 'Create a Volume',
  [modes.CREATING_FOR_LINODE]: (volumeLabel: string) => 'Create a Volume',
  [modes.RESIZING]: (volumeLabel: string) => `Resize volume ${volumeLabel}`,
  [modes.CLONING]: (volumeLabel: string) => `Clone volume ${volumeLabel}`,
  [modes.EDITING]: (volumeLabel: string) => `Rename volume ${volumeLabel}`,
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
      linodeId,
      linodeRegion,
      linodeLabel,
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
  }
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch) => ({
  actions: {
    closeDrawer: () => dispatch(close())
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
  linodeId?: number;
  linodeLabel?: string;
  linodeRegion?: string;
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
  } = state.volumeDrawer;

  return {
    drawerTitle: titleMap[mode](volumeLabel || ''),
    isOpen: mode !== modes.CLOSED,
    linodeId,
    linodeLabel,
    linodeRegion,
    mode,
    volumeId,
    volumeLabel,
    volumeRegion,
    volumeSize,
  }
};

const connected = connect(mapStateToProps, mapDispatchToProps);

export default connected(VolumeDrawer);
