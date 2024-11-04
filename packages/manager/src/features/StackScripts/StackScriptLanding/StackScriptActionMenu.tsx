import React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

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

  const isLinodeCreationRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
    permittedGrantLevel: 'read_write',
  });

  const isStackScriptReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'stackscript',
    id: stackscript.id,
  });

  const sharedActionOptions = isStackScriptReadOnly
    ? {
        disabled: true,
        tooltip: "You don't have permissions to modify this StackScript",
      }
    : {};

  const actions: Action[] = [
    {
      onClick: () => history.push(`/stackscripts/${stackscript.id}/edit`),
      title: 'Edit',
      ...sharedActionOptions,
    },
    {
      disabled: isLinodeCreationRestricted,
      onClick: () =>
        history.push(
          `/linodes/create?type=StackScripts&subtype=Account&stackScriptID=${stackscript.id}`
        ),
      title: 'Deploy New Linode',
      tooltip: isLinodeCreationRestricted
        ? "You don't have permissions to add Linodes"
        : undefined,
    },
    ...(!stackscript.is_public
      ? [
          {
            onClick: handlers.onMakePublic,
            title: 'Make StackScript Public',
            ...sharedActionOptions,
          },
          {
            onClick: handlers.onDelete,
            title: 'Delete',
            ...sharedActionOptions,
          },
        ]
      : []),
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for StackScript ${stackscript.label}`}
    />
  );
};
