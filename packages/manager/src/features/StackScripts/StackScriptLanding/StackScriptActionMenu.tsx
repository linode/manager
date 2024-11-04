import React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { StackScript } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

export interface StackScriptHandlers {
  onDelete: () => void;
  onMakePublic: () => void;
}

interface Props {
  handlers: StackScriptHandlers;
  stackscript: StackScript;
}

export const StackScriptActionMenu = (props: Props) => {
  const { handlers, stackscript } = props;

  const history = useHistory();

  const actions: Action[] = [
    {
      onClick: () => history.push(`/stackscripts/${stackscript.id}/edit`),
      title: 'Edit',
    },
    {
      onClick: () =>
        history.push(
          `/linodes/create?type=StackScripts&subtype=Account&stackScriptID=${stackscript.id}`
        ),
      title: 'Deploy New Linode',
    },
    { onClick: handlers.onMakePublic, title: 'Make StackScript Public' },
    { onClick: handlers.onDelete, title: 'Delete' },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for StackScript ${stackscript.label}`}
    />
  );
};
