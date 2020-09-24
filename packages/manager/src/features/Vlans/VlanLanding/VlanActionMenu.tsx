import * as React from 'react';
import { useHistory } from 'react-router-dom';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery
} from 'src/components/core/styles';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';
import InlineMenuAction from 'src/components/InlineMenuAction/InlineMenuAction';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: '0px !important',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  inlineActions: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  link: {
    padding: '12px 10px',
    textAlign: 'center',
    '&:hover': {
      backgroundColor: '#3683dc',
      '& span': {
        color: theme.color.white
      }
    },
    '& span': {
      color: '#3683dc'
    }
  },
  action: {
    marginLeft: 10
  },
  button: {
    minWidth: 70,
    ...theme.applyLinkStyles,
    height: '100%',
    padding: '12px 10px',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: '#3683dc',
      color: theme.color.white
    },
    '&[disabled]': {
      color: '#cdd0d5',
      cursor: 'default',
      '&:hover': {
        backgroundColor: 'inherit'
      }
    }
  }
}));

export interface ActionHandlers {
  triggerDeleteVlan: (vlanID: number, vlanLabel: string) => void;
}

interface Props extends ActionHandlers {
  vlanID: number;
  vlanLabel: string;
}

type CombinedProps = Props;

const VlanActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const history = useHistory();

  const { vlanID, vlanLabel, triggerDeleteVlan } = props;

  const inlineActions = [
    {
      actionText: 'Details',
      className: classes.link,
      href: `/vlans/${vlanID}`
    },
    {
      actionText: 'Delete',
      onClick: () => {
        triggerDeleteVlan(vlanID, vlanLabel);
      }
    }
  ];

  const createActions = () => (): Action[] => {
    return [
      {
        title: 'Details',
        onClick: () => {
          history.push({
            pathname: `/vlans/${vlanID}`
          });
        }
      },
      {
        title: 'Delete',
        onClick: () => {
          triggerDeleteVlan(vlanID, vlanLabel);
        }
      }
    ];
  };

  return (
    <div className={classes.root}>
      {!matchesSmDown &&
        inlineActions.map(action => {
          return (
            <InlineMenuAction
              key={action.actionText}
              actionText={action.actionText}
              className={action.className}
              href={action.href}
              onClick={action.onClick}
            />
          );
        })}
      {matchesSmDown && (
        <ActionMenu
          createActions={createActions()}
          ariaLabel={`Action menu for Virtual LAN ${props.vlanLabel}`}
        />
      )}
    </div>
  );
};

export default React.memo(VlanActionMenu);
