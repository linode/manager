import { path } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import { Theme, useTheme, useMediaQuery } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction/InlineMenuAction';
import withProfile from 'src/containers/profile.container';

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
}

interface ProfileProps {
  username?: string;
}

type CombinedProps = Props & RouteComponentProps<{}> & ProfileProps;

const StackScriptActionMenu: React.FC<CombinedProps> = props => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    stackScriptID,
    stackScriptUsername,
    history,
    triggerDelete,
    triggerMakePublic,
    stackScriptLabel,
    canModify,
    isPublic,
    username,
    category,
    canAddLinodes
  } = props;

  const readonlyProps = {
    disabled: !canModify,
    tooltip: !canModify
      ? "You don't have permissions to modify this StackScript"
      : undefined
  };

  const inlineActions: Action[] = [
    {
      title: 'Deploy',
      disabled: !canAddLinodes,
      tooltip: !canAddLinodes
        ? "You don't have permissions to add Linodes"
        : undefined,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        history.push(
          getStackScriptUrl(stackScriptUsername, stackScriptID, username)
        );
        e.preventDefault();
      }
    }
  ];

  if (category !== 'community') {
    inlineActions.unshift({
      title: 'Details',
      ...readonlyProps,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        history.push(`/stackscripts/${stackScriptID}/edit`);
        e.preventDefault();
      }
    });
  }

  const actions: Action[] = [];

  if (!isPublic) {
    actions.push({
      title: 'Make StackScript Public',
      ...readonlyProps,
      onClick: () => {
        triggerMakePublic(stackScriptID, stackScriptLabel);
      }
    });
    actions.push({
      title: 'Delete',
      ...readonlyProps,
      onClick: () => {
        triggerDelete(stackScriptID, stackScriptLabel);
      }
    });
  }

  if (matchesSmDown) {
    actions.unshift({
      title: 'Deploy',
      disabled: !canAddLinodes,
      tooltip: !canAddLinodes
        ? "You don't have permissions to add Linodes"
        : undefined,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        history.push(
          getStackScriptUrl(stackScriptUsername, stackScriptID, username)
        );
        e.preventDefault();
      }
    });
  }

  // We only add the "Details" option if the current tab/category isn't
  // "Community StackScripts". A user's own public StackScripts are still
  // editable under "Account StackScripts".
  if (matchesSmDown && category !== 'community') {
    actions.unshift({
      title: 'Details',
      ...readonlyProps,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        history.push(`/stackscripts/${stackScriptID}/edit`);
        e.preventDefault();
      }
    });
  }

  return (
    <>
      {!matchesSmDown &&
        inlineActions.map(action => {
          return (
            <InlineMenuAction
              key={action.title}
              actionText={action.title}
              onClick={action.onClick}
            />
          );
        })}
      {category !== 'community' && (
        <ActionMenu
          createActions={() => actions}
          ariaLabel={`Action menu for StackScript ${props.stackScriptLabel}`}
        />
      )}
    </>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withRouter,
  withProfile<ProfileProps, Props>((ownProps, { profileData: profile }) => {
    return {
      username: path(['data', 'username'], profile)
    };
  })
);

export default enhanced(StackScriptActionMenu);
