import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery
} from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0px !important'
  }
}));

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

export const VolumesActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();
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

  const inlineActions = [
    {
      actionText: 'Show Config',
      onClick: () => {
        handleShowConfig();
      }
    },
    {
      actionText: 'Edit',
      onClick: () => {
        handleOpenEdit();
      }
    }
  ];

  const createActions = () => {
    const { attached, poweredOff, isVolumesLanding } = props;

    return (): Action[] => {
      const actions = [
        {
          title: 'Resize',
          onClick: () => {
            handleResize();
          }
        },
        {
          title: 'Clone',
          onClick: () => {
            handleClone();
          }
        }
      ];

      if (matchesSmDown) {
        actions.unshift({
          title: 'Edit',
          onClick: () => {
            handleOpenEdit();
          }
        });
        actions.unshift({
          title: 'Show Config',
          onClick: () => {
            handleShowConfig();
          }
        });
      }

      if (!attached && isVolumesLanding) {
        actions.push({
          title: 'Attach',
          onClick: () => {
            handleAttach();
          }
        });
      } else {
        actions.push({
          title: 'Detach',
          onClick: () => {
            handleDetach();
          }
        });
      }

      if (!attached || poweredOff) {
        actions.push({
          title: 'Delete',
          onClick: () => {
            handleDelete();
          }
        });
      }

      return actions;
    };
  };

  return (
    <div className={classes.root}>
      {!matchesSmDown &&
        inlineActions.map(action => {
          return (
            <InlineMenuAction
              key={action.actionText}
              actionText={action.actionText}
              onClick={action.onClick}
            />
          );
        })}
      <ActionMenu
        createActions={createActions()}
        ariaLabel={`Action menu for Volume ${props.volumeLabel}`}
      />
    </div>
  );
};

export default withRouter(VolumesActionMenu);
