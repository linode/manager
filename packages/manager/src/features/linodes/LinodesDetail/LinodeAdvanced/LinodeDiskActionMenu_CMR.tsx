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
    justifyContent: 'flex-end'
  },
  button: {
    height: '100%',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 15,
    paddingRight: 15,
    minWidth: 'auto',
    ...theme.applyLinkStyles,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.color.white
    }
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

  const createActions = () => (): Action[] => {
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
        title: 'Imagize',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          props.onImagize();
        },
        ...(readOnly ? disabledProps : {})
      },
      {
        title: 'Clone',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
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
        disabled={props.linodeStatus !== 'offline'}
        tooltipText={
          props.linodeStatus !== 'offline'
            ? 'Your Linode must be fully powered down in order to perform this action'
            : ''
        }
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
