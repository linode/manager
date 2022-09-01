import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import Hidden from 'src/components/core/Hidden';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';
import { useProfile } from 'src/queries/profile';
import { getStackScriptUrl, StackScriptCategory } from '../stackScriptUtils';

interface Props {
  stackScriptID: number;
  stackScriptUsername: string;
  stackScriptLabel: string;
  triggerDelete: (id: number, label: string) => void;
  triggerMakePublic: (id: number, label: string) => void;
  canModify: boolean;
  canAddLinodes: boolean;
  isPublic: boolean;
  // @todo: when we implement StackScripts pagination, we should remove "| string" in the type below.
  // Leaving this in as an escape hatch now, since there's a bunch of code in
  // /LandingPanel that uses different values for categories that we shouldn't
  // change until we're actually using it.
  category: StackScriptCategory | string;
  isHeader?: boolean;
}

type CombinedProps = Props & RouteComponentProps<{}>;

const StackScriptActionMenu: React.FC<CombinedProps> = (props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: profile } = useProfile();

  const {
    stackScriptID,
    stackScriptUsername,
    history,
    triggerDelete,
    triggerMakePublic,
    stackScriptLabel,
    canModify,
    isPublic,
    category,
    canAddLinodes,
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
      title: 'Deploy New Linode',
      disabled: !canAddLinodes,
      tooltip: matchesSmDown
        ? !canAddLinodes
          ? "You don't have permissions to add Linodes"
          : undefined
        : undefined,
      onClick: () => {
        history.push(
          getStackScriptUrl(
            stackScriptUsername,
            stackScriptID,
            profile?.username
          )
        );
      },
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
        <Hidden smDown>
          {actions.map((action) => {
            return (
              <InlineMenuAction
                key={action.title}
                actionText={action.title}
                disabled={action.disabled}
                onClick={action.onClick}
              />
            );
          })}
        </Hidden>
      )}
    </>
  );
};

const enhanced = compose<CombinedProps, Props>(withRouter);

export default enhanced(StackScriptActionMenu);
