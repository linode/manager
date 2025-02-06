import { useMediaQuery } from '@mui/material';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import type { StackScript } from '@linode/api-v4';
import type { Theme } from '@mui/material';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

export interface StackScriptHandlers {
  onDelete: () => void;
  onMakePublic: () => void;
}

interface Props {
  handlers: StackScriptHandlers;
  stackscript: StackScript;
  type: 'account' | 'community';
}

export const StackScriptActionMenu = (props: Props) => {
  const { handlers, stackscript, type } = props;

  const history = useHistory();

  const isLargeScreen = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.up('md')
  );

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

  const actions: { action: Action; show: boolean }[] = [
    {
      action: {
        onClick: () => history.push(`/stackscripts/${stackscript.id}/edit`),
        title: 'Edit',
        ...sharedActionOptions,
      },
      show: type === 'account',
    },
    {
      action: {
        disabled: isLinodeCreationRestricted,
        onClick: () =>
          history.push(
            type === 'account'
              ? `/linodes/create?type=StackScripts&subtype=Account&stackScriptID=${stackscript.id}`
              : `/linodes/create?type=StackScripts&subtype=Community&stackScriptID=${stackscript.id}`
          ),
        title: 'Deploy New Linode',
        tooltip: isLinodeCreationRestricted
          ? "You don't have permissions to add Linodes"
          : undefined,
      },
      show: true,
    },
    {
      action: {
        onClick: handlers.onMakePublic,
        title: 'Make StackScript Public',
        ...sharedActionOptions,
      },
      show: !stackscript.is_public,
    },
    {
      action: {
        onClick: handlers.onDelete,
        title: 'Delete',
        ...sharedActionOptions,
      },
      show: !stackscript.is_public,
    },
  ];

  const filteredActions = actions.reduce<Action[]>((acc, action) => {
    if (action.show) {
      acc.push(action.action);
    }
    return acc;
  }, []);

  if (type === 'community' && isLargeScreen) {
    return filteredActions.map((action) => (
      <InlineMenuAction
        key={action.title}
        {...action}
        actionText={action.title}
      />
    ));
  }

  return (
    <ActionMenu
      actionsList={filteredActions}
      ariaLabel={`Action menu for StackScript ${stackscript.label}`}
    />
  );
};
