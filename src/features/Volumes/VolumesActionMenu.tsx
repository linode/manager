import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onShowConfig: (volumeLabel: string, volumePath: string) => void;
  onEdit: (volumeId: number, volumeLabel: string, volumeTags: string[]) => void;
  onResize: (volumeId: number, volumeSize: number, volumeLabel: string) => void;
  onClone: (
    volumeId: number,
    label: string,
    size: number,
    regionID: string
  ) => void;
  attached: boolean;
  onAttach: (volumeId: number, label: string, linodeRegion: string) => void;
  onDetach: (volumeId: number) => void;
  poweredOff: boolean;
  onDelete: (volumeId: number) => void;
  filesystemPath: string;
  label: string;
  linodeLabel: string;
  regionID: string;
  volumeId: number;
  volumeTags: string[];
  size: number;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export class VolumesActionMenu extends React.Component<CombinedProps> {
  handleShowConfig = () => {
    const { onShowConfig, label, filesystemPath } = this.props;
    onShowConfig(label, filesystemPath);
  };

  handleOpenEdit = () => {
    const { volumeId, label, volumeTags, onEdit } = this.props;
    onEdit(volumeId, label, volumeTags);
  };

  handleResize = () => {
    const { volumeId, size, label, onResize } = this.props;
    onResize(volumeId, size, label);
  };

  handleClone = () => {
    const { volumeId, label, size, regionID, onClone } = this.props;
    onClone(volumeId, label, size, regionID);
  };

  handleAttach = () => {
    const { volumeId, label, regionID, onAttach } = this.props;
    onAttach(volumeId, label, regionID);
  };

  handleDetach = () => {
    const { volumeId, onDetach } = this.props;
    onDetach(volumeId);
  };

  handleDelete = () => {
    const { volumeId, onDelete } = this.props;
    onDelete(volumeId);
  };

  createActions = () => {
    const { attached, poweredOff } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'Show Configuration',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleShowConfig();
            closeMenu();
            e.preventDefault();
          }
        },
        {
          title: 'Edit Volume',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleOpenEdit();
            closeMenu();
            e.preventDefault();
          }
        },
        {
          title: 'Resize',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleResize();
            closeMenu();
            e.preventDefault();
          }
        },
        {
          title: 'Clone',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleClone();
            closeMenu();
            e.preventDefault();
          }
        }
      ];

      if (!attached) {
        actions.push({
          title: 'Attach',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleAttach();
            closeMenu();
            e.preventDefault();
          }
        });
      } else {
        actions.push({
          title: 'Detach',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleDetach();
            closeMenu();
            e.preventDefault();
          }
        });
      }

      if (!attached || poweredOff) {
        actions.push({
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleDelete();
            closeMenu();
            e.preventDefault();
          }
        });
      }

      return actions;
    };
  };

  render() {
    return <ActionMenu createActions={this.createActions()} />;
  }
}

export default withRouter(VolumesActionMenu);
