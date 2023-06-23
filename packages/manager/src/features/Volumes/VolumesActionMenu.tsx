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
    const { filesystemPath, label, openForConfig } = props;
    openForConfig(label, filesystemPath);
  };

  const handleOpenEdit = () => {
    const { label, openForEdit, volumeId, volumeTags } = props;
    openForEdit(volumeId, label, volumeTags);
  };

  const handleResize = () => {
    const { label, openForResize, size, volumeId } = props;
    openForResize(volumeId, size, label);
  };

  const handleClone = () => {
    const { label, openForClone, regionID, size, volumeId } = props;
    openForClone(volumeId, label, size, regionID);
  };

  const handleAttach = () => {
    const { handleAttach, label, regionID, volumeId } = props;
    handleAttach(volumeId, label, regionID);
  };

  const handleDetach = () => {
    const {
      handleDetach,
      linodeId,
      linodeLabel,
      volumeId,
      volumeLabel,
    } = props;
    handleDetach(volumeId, volumeLabel, linodeLabel, linodeId);
  };

  const handleDelete = () => {
    const { handleDelete, volumeId, volumeLabel } = props;
    handleDelete(volumeId, volumeLabel);
  };

  const actions: Action[] = [
    {
      onClick: () => {
        handleShowConfig();
      },
      title: 'Show Config',
    },
    {
      onClick: () => {
        handleOpenEdit();
      },
      title: 'Edit',
    },
    {
      onClick: () => {
        handleResize();
      },
      title: 'Resize',
    },
    {
      onClick: () => {
        handleClone();
      },
      title: 'Clone',
    },
  ];

  if (!attached && isVolumesLanding) {
    actions.push({
      onClick: () => {
        handleAttach();
      },
      title: 'Attach',
    });
  } else {
    actions.push({
      onClick: () => {
        handleDetach();
      },
      title: 'Detach',
    });
  }

  actions.push({
    disabled: attached,
    onClick: () => {
      handleDelete();
    },
    title: 'Delete',
    tooltip: attached
      ? 'Your volume must be detached before it can be deleted.'
      : undefined,
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
