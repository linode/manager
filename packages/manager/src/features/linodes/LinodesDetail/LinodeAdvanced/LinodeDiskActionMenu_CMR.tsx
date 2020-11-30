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
      padding: '10px 10px 10px 0',
      marginLeft: -8,
      '& svg': {
        height: 20,
        width: 20,
        color: theme.cmrTextColors.linkActiveLight
      }
    }
  },
  button: {
    ...theme.applyLinkStyles,
    color: theme.cmrTextColors.linkActiveLight,
    height: '100%',
    padding: '12px 15px',
    minWidth: 'auto',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: '#ffffff'
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
  const { linodeStatus, readOnly } = props;

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

  const createActions = () => (): Action[] => {
    const { linodeId, readOnly, history, diskId } = props;

    return [
      {
        title: 'Imagize',
        onClick: () => {
          props.onImagize();
        },
        ...(readOnly ? disabledProps : {})
      },
      {
        title: 'Clone',
        onClick: () => {
          history.push(
            `/linodes/${linodeId}/clone/disks?selectedDisk=${diskId}`
          );
        },
        ...(readOnly ? disabledProps : {})
      },
      {
        title: 'Delete',
        onClick: () => {
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
        disabled={props.readOnly}
        tooltipText={props.readOnly ? tooltip : ''}
      >
        Rename
      </Button>
      <Button
        className={classes.button}
        onClick={e => {
          e.preventDefault();
          props.onResize();
        }}
        disabled={props.linodeStatus !== 'offline' || props.readOnly}
        tooltipText={
          props.linodeStatus !== 'offline' || props.readOnly ? tooltip : ''
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
