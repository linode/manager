import { splitAt } from 'ramda';
import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import { useTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
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
  handleUpgrade?: (volumeId: number, label: string) => void;
  handleDetach: (
    volumeId: number,
    volumeLabel: string,
    linodeLabel: string,
    linodeId: number
  ) => void;
  handleDelete: (volumeId: number, volumeLabel: string) => void;
}

export interface Props extends ActionHandlers {
  attached: boolean;
  isVolumesLanding: boolean;
  filesystemPath: string;
  label: string;
  linodeLabel: string;
  linodeId: number;
  regionID: string;
  volumeId: number;
  volumeLabel: string;
  volumeTags: string[];
  size: number;
}

export const VolumesActionMenu = (props: Props) => {
  const { attached, isVolumesLanding } = props;

  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const handleShowConfig = () => {
    const { openForConfig, label, filesystemPath } = props;
    openForConfig(label, filesystemPath);
  };

  const handleOpenEdit = () => {
    const { openForEdit, volumeId, label, volumeTags } = props;
    openForEdit(volumeId, label, volumeTags);
  };

  const handleResize = () => {
    const { openForResize, volumeId, size, label } = props;
    openForResize(volumeId, size, label);
  };

  const handleClone = () => {
    const { openForClone, volumeId, label, size, regionID } = props;
    openForClone(volumeId, label, size, regionID);
  };

  const handleAttach = () => {
    const { handleAttach, volumeId, label, regionID } = props;
    handleAttach(volumeId, label, regionID);
  };

  const handleDetach = () => {
    const {
      handleDetach,
      volumeId,
      volumeLabel,
      linodeLabel,
      linodeId,
    } = props;
    handleDetach(volumeId, volumeLabel, linodeLabel, linodeId);
  };

  const handleDelete = () => {
    const { handleDelete, volumeId, volumeLabel } = props;
    handleDelete(volumeId, volumeLabel);
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

  actions.push({
    title: 'Delete',
    onClick: () => {
      handleDelete();
    },
  });

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

export default VolumesActionMenu;
