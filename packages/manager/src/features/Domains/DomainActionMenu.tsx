import { splitAt } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

import type { Domain } from '@linode/api-v4/lib/domains';
import type { Theme } from '@mui/material/styles';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

const useStyles = makeStyles()(() => ({
  button: {
    justifyContent: 'flex-start',
    minWidth: 66,
  },
}));

export interface Handlers {
  onClone: (domain: Domain) => void;
  onDisableOrEnable: (status: 'disable' | 'enable', domain: Domain) => void;
  onEdit: (domain: Domain) => void;
  onRemove: (domain: Domain) => void;
}

interface Props extends Handlers {
  domain: Domain;
}

interface ExtendedAction extends Action {
  className?: string;
}

interface DomainActionMenuProps extends Props, Handlers {}

export const DomainActionMenu = React.memo((props: DomainActionMenuProps) => {
  const { classes } = useStyles();

  const { domain, onClone, onDisableOrEnable, onEdit, onRemove } = props;

  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const actions = [
    {
      onClick: () => {
        onEdit(domain);
      },
      title: 'Edit',
    },
    {
      className: classes.button,
      onClick: () => {
        onDisableOrEnable(
          domain.status === 'active' ? 'disable' : 'enable',
          domain
        );
      },
      title: domain.status === 'active' ? 'Disable' : 'Enable',
    },
    {
      onClick: () => {
        onClone(domain);
      },
      title: 'Clone',
    },
    {
      onClick: () => {
        onRemove(domain);
      },
      title: 'Delete',
    },
  ] as ExtendedAction[];

  // Index at which non-inline actions begin. Our convention: place actions that are inline (at non-mobile/non-tablet viewports) at start of the array.
  const splitActionsArrayIndex = matchesSmDown ? 0 : 2;

  const [inlineActions, menuActions] = splitAt(splitActionsArrayIndex, actions);

  return (
    <>
      {!matchesSmDown &&
        inlineActions.map((action) => {
          return (
            <InlineMenuAction
              actionText={action.title}
              className={action.className}
              key={action.title}
              onClick={action.onClick}
            />
          );
        })}
      <ActionMenu
        actionsList={menuActions}
        ariaLabel={`Action menu for Domain ${domain.domain}`}
      />
    </>
  );
});
