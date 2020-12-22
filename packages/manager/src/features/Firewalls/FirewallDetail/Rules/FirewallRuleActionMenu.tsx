import * as React from 'react';
import ActionMenu, {
  Action,
  ActionMenuProps
} from 'src/components/ActionMenu_CMR';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

interface Props extends Partial<ActionMenuProps> {
  idx: number;
  triggerDeleteFirewallRule: (idx: number) => void;
  triggerOpenRuleDrawerForEditing: (idx: number) => void;
}

type CombinedProps = Props;

const FirewallRuleActionMenu: React.FC<CombinedProps> = props => {
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
        inlineActions.map(action => {
          return (
            <InlineMenuAction
              key={action.actionText}
              actionText={action.actionText}
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
