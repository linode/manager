import { splitAt } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

export interface ActionHandlers {
  openForConfig: (volumeLabel: string, volumePath: string) => void;
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
    label: string,
    size: number,
    regionID: string
  ) => void;
  handleAttach: (volumeId: number, label: string, linodeRegion: string) => void;
  handleDetach: (
    volumeId: number,
    volumeLabel: string,
    linodeLabel: string,
    poweredOff: boolean
  ) => void;
  handleDelete: (volumeId: number, volumeLabel: string) => void;
  [index: string]: any;
}

interface Props extends ActionHandlers {
  attached: boolean;
  isVolumesLanding: boolean;
  poweredOff: boolean;
  filesystemPath: string;
  label: string;
  linodeLabel: string;
  regionID: string;
  volumeId: number;
  volumeLabel: string;
  volumeTags: string[];
  size: number;
}

export type CombinedProps = Props & RouteComponentProps<{}>;

export const VolumesActionMenu: React.FC<CombinedProps> = (props) => {
  const { attached, poweredOff, isVolumesLanding } = props;

  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const handleShowConfig = () => {
    const { onShowConfig, label, filesystemPath } = props;
    onShowConfig(label, filesystemPath);
  };

  const handleOpenEdit = () => {
    const { onEdit, volumeId, label, volumeTags } = props;
    onEdit(volumeId, label, volumeTags);
  };

  const handleResize = () => {
    const { onResize, volumeId, size, label } = props;
    onResize(volumeId, size, label);
  };

  const handleClone = () => {
    const { onClone, volumeId, label, size, regionID } = props;
    onClone(volumeId, label, size, regionID);
  };

  const handleAttach = () => {
    const { onAttach, volumeId, label, regionID } = props;
    onAttach(volumeId, label, regionID);
  };

  const handleDetach = () => {
    const { onDetach, volumeId, volumeLabel, linodeLabel, poweredOff } = props;
    onDetach(volumeId, volumeLabel, linodeLabel, poweredOff);
  };

  const handleDelete = () => {
    const { onDelete, volumeId, volumeLabel } = props;
    onDelete(volumeId, volumeLabel);
  };

  const actions: Action[] = [
    {
      title: 'Show Config',
      onClick: () => {
        handleShowConfig();
      },
    },
    {
      title: 'Edit',
      onClick: () => {
        handleOpenEdit();
      },
    },
    {
      title: 'Resize',
      onClick: () => {
        handleResize();
      },
    },
    {
      title: 'Clone',
      onClick: () => {
        handleClone();
      },
    },
  ];

  if (!attached && isVolumesLanding) {
    actions.push({
      title: 'Attach',
      onClick: () => {
        handleAttach();
      },
    });
  } else {
    actions.push({
      title: 'Detach',
      onClick: () => {
        handleDetach();
      },
    });
  }

  if (!attached || poweredOff) {
    actions.push({
      title: 'Delete',
      onClick: () => {
        handleDelete();
      },
    });
  }

  const splitActionsArrayIndex = matchesSmDown ? 0 : 2;
  const [inlineActions, menuActions] = splitAt(splitActionsArrayIndex, actions);

  return (
    <>
      {!matchesSmDown &&
        inlineActions.map((action) => {
          return (
            <InlineMenuAction
              key={action.title}
              actionText={action.title}
              onClick={action.onClick}
            />
          );
        })}
      <ActionMenu
        actionsList={menuActions}
        ariaLabel={`Action menu for Volume ${props.volumeLabel}`}
      />
    </>
  );
};

export default withRouter(VolumesActionMenu);
