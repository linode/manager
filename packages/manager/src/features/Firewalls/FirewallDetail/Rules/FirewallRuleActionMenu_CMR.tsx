import * as React from 'react';
import ActionMenu, {
  Action,
  ActionMenuProps
} from 'src/components/ActionMenu_CMR';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery
} from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction/InlineMenuAction';

const useStyles = makeStyles((theme: Theme) => ({
  inlineActions: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  link: {
    padding: '12px 10px'
  }
}));

interface Props extends Partial<ActionMenuProps> {
  idx: number;
  triggerDeleteFirewallRule: (idx: number) => void;
  triggerOpenRuleDrawerForEditing: (idx: number) => void;
}

type CombinedProps = Props;

const FirewallRuleActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    idx,
    triggerDeleteFirewallRule,
    triggerOpenRuleDrawerForEditing,
    ...actionMenuProps
  } = props;

  const inlineActions = [
    {
      actionText: 'Edit',
      className: classes.link,
      onClick: () => {
        triggerOpenRuleDrawerForEditing(idx);
      }
    },
    {
      actionText: 'Delete',
      onClick: () => {
        triggerDeleteFirewallRule(idx);
      }
    }
  ];

  const createActions = () => (): Action[] => {
    return [
      {
        title: 'Edit',
        onClick: () => {
          triggerOpenRuleDrawerForEditing(idx);
        }
      },
      {
        title: 'Delete',
        onClick: () => {
          triggerDeleteFirewallRule(idx);
        }
      }
    ];
  };

  return (
    <>
      {!matchesSmDown &&
        // inTableContext &&
        inlineActions.map(action => {
          return (
            <InlineMenuAction
              key={action.actionText}
              actionText={action.actionText}
              className={action.className}
              onClick={action.onClick}
            />
          );
        })}
      {matchesSmDown && (
        <ActionMenu
          createActions={createActions()}
          ariaLabel={`Action menu for Firewall Rule`}
          {...actionMenuProps}
        />
      )}
    </>
  );
};

export default React.memo(FirewallRuleActionMenu);
