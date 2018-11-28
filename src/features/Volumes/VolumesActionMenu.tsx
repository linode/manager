import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onShowConfig: (path: string, label: string) => void;
  onEdit: (
    volumeId: number,
    volumeLabel: string,
    volumeTags: string[],
  ) => void;
  onResize: (
    volumeId: number,
    volumeSize: number,
    volumeLabel: string,
  ) => void;
  onClone: (
    volumeID: number,
    label: string,
    size: number,
    regionID: string,
  ) => void;
  attached: boolean;
  onAttach: (
    volumeID: number,
    label: string,
    linodeRegion: string,
  ) => void;
  onDetach: (volumeID: number) => void;
  poweredOff: boolean;
  onDelete: (volumeID: number) => void;
  filesystemPath: string;
  label: string;
  linodeLabel: string;
  regionID: string;
  volumeID: number;
  volumeTags: string[];
  size: number;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class VolumesActionMenu extends React.Component<CombinedProps> {
  handleShowConfig = () => {
    const { onShowConfig, label, filesystemPath } = this.props;
    onShowConfig(filesystemPath, label)
  }

  handleOpenEdit = () => {
    const {
      volumeID,
      label,
      volumeTags,
      onEdit
    } = this.props;
    onEdit(volumeID, label, volumeTags)
  }

  handleResize = () => {
    const {
      volumeID,
      size,
      label,
      onResize,
    } = this.props;
    onResize(volumeID, size, label)
  }

  handleClone = () => {
    const {
      volumeID,
      label,
      size,
      regionID,
      onClone
    } = this.props;
    onClone(volumeID, label, size, regionID)
  }

  handleAttach = () => {
    const {
      volumeID,
      label,
      regionID,
      onAttach
    } = this.props;
    onAttach(volumeID, label, regionID);
  }

  handleDetach = () => {
    const {
      volumeID,
      onDetach
    } = this.props;
    onDetach(volumeID);
  }

  handleDelete = () => {
    const {
      volumeID,
      onDelete
    } = this.props;
    onDelete(volumeID);
  }

  createActions = () => {
    const {
      attached,
      poweredOff,
    } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Show Configuration',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleShowConfig();
            closeMenu();
            e.preventDefault();
          },
        },
        {
          title: 'Edit Volume',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleOpenEdit();
            closeMenu();
            e.preventDefault();
          },
        },
        {
          title: 'Resize',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleResize();
            closeMenu();
            e.preventDefault();
          },
        },
        {
          title: 'Clone',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleClone();
            closeMenu();
            e.preventDefault();
          },
        },
      ];

      if (!attached) {
        actions.push({
          title: 'Attach',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleAttach();
            closeMenu();
            e.preventDefault();
          },
        });
      } else {
        actions.push({
          title: 'Detach',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleDetach();
            closeMenu();
            e.preventDefault();
          },
        });
      }

      if ((!attached) || poweredOff) {
        actions.push({
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleDelete();
            closeMenu();
            e.preventDefault();
          },
        });
      }

      return actions;
    };
  }

  render() {
    return (
      <ActionMenu createActions={this.createActions()} />
    );
  }
}

export default withRouter(VolumesActionMenu);
