import { Theme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Action, ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Hidden } from 'src/components/Hidden';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { useProfile } from 'src/queries/profile';

import { StackScriptCategory, getStackScriptUrl } from '../stackScriptUtils';

interface Props {
  canAddLinodes: boolean;
  canModify: boolean;
  // change until we're actually using it.
  category: StackScriptCategory | string;
  isHeader?: boolean;
  isPublic: boolean;
  stackScriptID: number;
  stackScriptLabel: string;
  stackScriptUsername: string;
  // @todo: when we implement StackScripts pagination, we should remove "| string" in the type below.
  // Leaving this in as an escape hatch now, since there's a bunch of code in
  // /LandingPanel that uses different values for categories that we shouldn't
  triggerDelete: (id: number, label: string) => void;
  triggerMakePublic: (id: number, label: string) => void;
}

export const StackScriptActionMenu = (props: Props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const { data: profile } = useProfile();
  const history = useHistory();

  const {
    canAddLinodes,
    canModify,
    category,
    isPublic,
    stackScriptID,
    stackScriptLabel,
    stackScriptUsername,
    triggerDelete,
    triggerMakePublic,
  } = props;

  const readonlyProps = {
    disabled: !canModify,
    tooltip: !canModify
      ? "You don't have permissions to modify this StackScript"
      : undefined,
  };

  const actions = [
    // We only add the "Edit" option if the current tab/category isn't
    // "Community StackScripts". A user's own public StackScripts are still
    // editable under "Account StackScripts".
    category === 'account'
      ? {
          title: 'Edit',
          ...readonlyProps,
          onClick: () => {
            history.push(`/stackscripts/${stackScriptID}/edit`);
          },
        }
      : null,
    {
      disabled: !canAddLinodes,
      onClick: () => {
        history.push(
          getStackScriptUrl(
            stackScriptUsername,
            stackScriptID,
            profile?.username
          )
        );
      },
      title: 'Deploy New Linode',
      tooltip: matchesSmDown
        ? !canAddLinodes
          ? "You don't have permissions to add Linodes"
          : undefined
        : undefined,
    },
    !isPublic
      ? {
          title: 'Make StackScript Public',
          ...readonlyProps,
          onClick: () => {
            triggerMakePublic(stackScriptID, stackScriptLabel);
          },
        }
      : null,
    !isPublic
      ? {
          title: 'Delete',
          ...readonlyProps,
          onClick: () => {
            triggerDelete(stackScriptID, stackScriptLabel);
          },
        }
      : null,
  ].filter(Boolean) as Action[];

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {category === 'account' || matchesSmDown ? (
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for StackScript ${props.stackScriptLabel}`}
        />
      ) : (
        <Hidden mdDown>
          {actions.map((action) => {
            return (
              <InlineMenuAction
                actionText={action.title}
                disabled={action.disabled}
                key={action.title}
                onClick={action.onClick}
              />
            );
          })}
        </Hidden>
      )}
    </>
  );
};
