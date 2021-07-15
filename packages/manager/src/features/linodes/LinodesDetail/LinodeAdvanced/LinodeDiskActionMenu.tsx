import { splitAt } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import {
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme,
} from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
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

export const DiskActionMenu: React.FC<CombinedProps> = (props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const classes = useStyles();

  const { linodeStatus, readOnly, linodeId, history, diskId } = props;

  let _tooltip =
    linodeStatus === 'offline'
      ? undefined
      : 'Your Linode must be fully powered down in order to perform this action';
  _tooltip = readOnly
    ? "You don't have permissions to perform this action"
    : _tooltip;

  const disabledProps = _tooltip
    ? {
        tooltip: _tooltip,
        disabled: true,
      }
    : {};

  const actions: Action[] = [
    {
      title: 'Rename',
      onClick: () => {
        props.onRename();
      },
      disabled: readOnly,
      tooltip: readOnly ? _tooltip : '',
    },
    {
      title: 'Resize',
      onClick: () => {
        props.onResize();
      },
      ...disabledProps,
    },
    {
      title: 'Imagize',
      onClick: () => {
        props.onImagize();
      },
      ...(readOnly ? disabledProps : {}),
    },
    {
      title: 'Clone',
      onClick: () => {
        history.push(`/linodes/${linodeId}/clone/disks?selectedDisk=${diskId}`);
      },
      ...(readOnly ? disabledProps : {}),
    },
    {
      title: 'Delete',
      onClick: () => {
        props.onDelete();
      },
      ...disabledProps,
    },
  ];

  const splitActionsArrayIndex = matchesSmDown ? 0 : 2;
  const [inlineActions, menuActions] = splitAt(splitActionsArrayIndex, actions);

  return (
    <div className={classes.root}>
      {!matchesSmDown &&
        inlineActions!.map((action) => {
          return (
            <InlineMenuAction
              key={action.title}
              actionText={action.title}
              onClick={action.onClick}
              disabled={action.disabled}
              tooltip={action.tooltip}
            />
          );
        })}
      <ActionMenu
        actionsList={menuActions}
        ariaLabel={`Action menu for Disk ${props.label}`}
      />
    </div>
  );
};

export default withRouter(DiskActionMenu);
