import { DomainStatus } from '@linode/api-v4/lib/domains';
import { splitAt } from 'ramda';
import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
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

export const DomainActionMenu: React.FC<CombinedProps> = (props) => {
  const {
    domain,
    id,
    onClone,
    onDisableOrEnable,
    onEdit,
    onRemove,
    status,
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

  const actions: Action[] = [
    {
      title: 'Edit',
      onClick: () => {
        handleEdit();
      },
    },
    {
      title: status === 'active' ? 'Disable' : 'Enable',
      onClick: () => {
        onDisableOrEnable(
          status === 'active' ? 'disable' : 'enable',
          domain,
          id
        );
      },
    },
    {
      title: 'Clone',
      onClick: () => {
        handleClone();
      },
    },
    {
      title: 'Delete',
      onClick: () => {
        handleRemove();
      },
    },
  ];

  // Index at which non-inline actions begin. Our convention: place actions that are inline (at non-mobile/non-tablet viewports) at start of the array.
  const splitActionsArrayIndex = matchesSmDown ? 0 : 2;

  const [inlineActions, menuActions] = splitAt(splitActionsArrayIndex, actions);

  return (
    <>
      {!matchesSmDown &&
        inlineActions.map((action) => {
          return (
            <InlineMenuAction
              key={action.title}
              actionText={action.title}
              onClick={action.onClick}
            />
          );
        })}
      <ActionMenu
        actionsList={menuActions}
        ariaLabel={`Action menu for Domain ${domain}`}
      />
    </>
  );
};

export default React.memo(DomainActionMenu);
