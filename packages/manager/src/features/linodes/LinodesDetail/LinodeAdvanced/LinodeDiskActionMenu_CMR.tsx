import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

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
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const { linodeStatus, readOnly } = props;

  let _tooltip =
    linodeStatus === 'offline'
      ? undefined
      : 'Your Linode must be fully powered down in order to perform this action';
  _tooltip = readOnly
    ? "You don't have permissions to perform this action"
    : _tooltip;
  const disabledProps = _tooltip
    ? {
        _tooltip,
        disabled: true
      }
    : {};

  const inlineActions = [
    {
      actionText: 'Rename',
      onClick: () => {
        props.onRename();
      },
      disabled: props.readOnly,
      tooltipText: props.readOnly ? _tooltip : ''
    },
    {
      actionText: 'Resize',
      onClick: () => {
        props.onResize();
      },
      disabled: props.linodeStatus !== 'offline' || props.readOnly,
      tooltipText:
        props.linodeStatus !== 'offline' || props.readOnly ? _tooltip : ''
    }
  ];

  const createActions = () => (): Action[] => {
    const { linodeId, readOnly, history, diskId } = props;

    const actions: Action[] = [
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

    if (matchesSmDown) {
      actions.unshift(
        {
          title: 'Rename',
          onClick: () => {
            props.onRename();
          },
          disabled: props.readOnly,
          tooltip: props.readOnly ? _tooltip : ''
        },
        {
          title: 'Resize',
          onClick: () => {
            props.onResize();
          },
          disabled: props.linodeStatus !== 'offline' || props.readOnly,
          tooltip:
            props.linodeStatus !== 'offline' || props.readOnly ? _tooltip : ''
        }
      );
    }

    return actions;
  };

  return (
    <>
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
        ariaLabel={`Action menu for Disk ${props.label}`}
      />
    </>
  );
};

export default withRouter(DiskActionMenu);
