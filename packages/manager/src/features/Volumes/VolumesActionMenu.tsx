import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import { splitAt } from 'ramda';
import * as React from 'react';

import { Action, ActionMenu } from 'src/components/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

export interface ActionHandlers {
  handleAttach: (volumeId: number, label: string, linodeRegion: string) => void;
  handleDelete: (volumeId: number, volumeLabel: string) => void;
  handleDetach: (
    volumeId: number,
    volumeLabel: string,
    linodeLabel: string,
    linodeId: number
  ) => void;
  handleUpgrade?: (volumeId: number, label: string) => void;
  openForClone: (
    volumeId: number,
    label: string,
    size: number,
    regionID: string
  ) => void;
  openForConfig: (volumeLabel: string, volumePath: string) => void;
  openForEdit: (
    volumeId: number,
    volumeLabel: string,
    volumeTags: string[]
  ) => void;
  openForResize: (
    volumeId: number,
    volumeSize: number,
    volumeLabel: string,
    volumeRegion: string
  ) => void;
}

export interface Props extends ActionHandlers {
  attached: boolean;
  filesystemPath: string;
  isVolumesLanding: boolean;
  label: string;
  linodeId: number;
  linodeLabel: string;
  regionID: string;
  size: number;
  volumeId: number;
  volumeLabel: string;
  volumeRegion: string;
  volumeTags: string[];
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
    const { label, openForResize, size, volumeId, volumeRegion } = props;
    openForResize(volumeId, size, label, volumeRegion);
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
              actionText={action.title}
              key={action.title}
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
