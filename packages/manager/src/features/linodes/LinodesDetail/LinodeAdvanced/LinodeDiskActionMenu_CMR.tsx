import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  inlineActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  button: {
    marginRight: 20,
    minWidth: 'auto',
    ...theme.applyLinkStyles
  }
}));

interface Props {
  linodeStatus: string;
  linodeId?: number;
  diskId?: number;
  label: string;
  readOnly?: boolean;
  onRename: () => void;
  onResize: () => void;
  onImagize: () => void;
  onDelete: () => void;
}

type CombinedProps = Props & RouteComponentProps;

export const DiskActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const createActions = () => (closeMenu: Function): Action[] => {
    const { linodeStatus, linodeId, readOnly, history, diskId } = props;
    let tooltip;
    tooltip =
      linodeStatus === 'offline'
        ? undefined
        : 'Your Linode must be fully powered down in order to perform this action';
    tooltip = readOnly
      ? "You don't have permissions to perform this action"
      : tooltip;
    const disabledProps = tooltip
      ? {
          tooltip,
          disabled: true
        }
      : {};
    return [
      {
        title: 'Rename',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          props.onRename();
          closeMenu();
        },
        ...(readOnly ? disabledProps : {})
      },
      {
        title: 'Resize',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          props.onResize();
          closeMenu();
        },
        ...disabledProps
      },
      {
        title: 'Imagize',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          props.onImagize();
          closeMenu();
        },
        ...(readOnly ? disabledProps : {})
      },
      {
        title: 'Clone',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          closeMenu();
          history.push(
            `/linodes/${linodeId}/clone/disks?selectedDisk=${diskId}`
          );
        },
        disabled: readOnly
      },
      {
        title: 'Delete',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          props.onDelete();
          closeMenu();
        },
        ...(readOnly ? disabledProps : {})
      }
    ];
  };

  return (
    <div className={classes.inlineActions}>
      <Button
        className={classes.button}
        onClick={e => {
          e.preventDefault();
          props.onRename();
        }}
      >
        Rename
      </Button>
      <Button
        className={classes.button}
        onClick={e => {
          e.preventDefault();
          props.onResize();
        }}
      >
        Resize
      </Button>
      <ActionMenu
        createActions={createActions()}
        ariaLabel={`Action menu for Disk ${props.label}`}
      />
    </div>
  );
};

export default withRouter(DiskActionMenu);
