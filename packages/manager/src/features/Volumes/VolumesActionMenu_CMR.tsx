import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  inlineActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    '& .MuiIconButton-root': {
      padding: '15px 10px 15px 0',
      marginLeft: -8,
      '& svg': {
        height: 20,
        width: 20
      }
    }
  },
  button: {
    ...theme.applyLinkStyles,
    height: '100%',
    padding: '12px 15px',
    minWidth: 'auto',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.color.white
    }
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

  const createActions = () => {
    const { attached, poweredOff, isVolumesLanding } = props;

    return (): Action[] => {
      const actions = [
        {
          title: 'Resize',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            handleResize();
          }
        },
        {
          title: 'Clone',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            handleClone();
          }
        }
      ];

      if (!attached && isVolumesLanding) {
        actions.push({
          title: 'Attach',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            handleAttach();
          }
        });
      } else {
        actions.push({
          title: 'Detach',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            handleDetach();
          }
        });
      }

      if (!attached || poweredOff) {
        actions.push({
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            handleDelete();
          }
        });
      }

      return actions;
    };
  };

  return (
    <div className={classes.inlineActions}>
      <Button
        className={classes.button}
        onClick={e => {
          e.preventDefault();
          handleShowConfig();
        }}
      >
        Details
      </Button>
      <Button
        className={classes.button}
        onClick={e => {
          e.preventDefault();
          handleOpenEdit();
        }}
      >
        Edit
      </Button>
      <ActionMenu
        createActions={createActions()}
        ariaLabel={`Action menu for Volume ${props.volumeLabel}`}
      />
    </div>
  );
};

export default withRouter(VolumesActionMenu);
