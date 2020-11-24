import { DomainStatus } from '@linode/api-v4/lib/domains';
import * as React from 'react';
import { Theme, useTheme, useMediaQuery } from 'src/components/core/styles';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';
import InlineMenuAction from 'src/components/InlineMenuAction';

export interface Handlers {
  onRemove: (domain: string, id: number) => void;
  onDisableOrEnable: (
    status: 'enable' | 'disable',
    domain: string,
    id: number
  ) => void;
  onClone: (domain: string, id: number) => void;
  onEdit: (domain: string, id: number) => void;
  [index: string]: any;
}

interface Props extends Handlers {
  type: 'master' | 'slave';
  domain: string;
  id: number;
  status: DomainStatus;
}

type CombinedProps = Props;

export const DomainActionMenu: React.FC<CombinedProps> = props => {
  const {
    domain,
    id,
    onClone,
    onDisableOrEnable,
    onEdit,
    onRemove,
    status
  } = props;

  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRemove = () => {
    onRemove(domain, id);
  };

  const handleEdit = () => {
    onEdit(domain, id);
  };

  const handleClone = () => {
    onClone(domain, id);
  };

  const inlineActions = [
    {
      actionText: 'Edit',
      onClick: () => {
        handleEdit();
      }
    },
    {
      actionText: status === 'active' ? 'Disable' : 'Enable',
      onClick: () => {
        onDisableOrEnable(
          status === 'active' ? 'disable' : 'enable',
          domain,
          id
        );
      }
    }
  ];

  const createActions = () => (): Action[] => {
    const baseActions = [
      {
        title: 'Clone',
        onClick: () => {
          handleClone();
        }
      },
      {
        title: 'Delete',
        onClick: () => {
          handleRemove();
        }
      }
    ];

    if (matchesSmDown) {
      baseActions.unshift({
        title: status === 'active' ? 'Disable' : 'Enable',
        onClick: () => {
          onDisableOrEnable(
            status === 'active' ? 'disable' : 'enable',
            domain,
            id
          );
        }
      });
      baseActions.unshift({
        title: 'Edit',
        onClick: () => {
          handleEdit();
        }
      });
    }
    return [...baseActions];
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
        ariaLabel={`Action menu for Domain ${domain}`}
      />
    </>
  );
};

export default React.memo(DomainActionMenu);
