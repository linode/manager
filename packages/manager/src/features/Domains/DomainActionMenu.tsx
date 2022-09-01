import { Domain } from '@linode/api-v4/lib/domains';
import { splitAt } from 'ramda';
import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import {
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme,
} from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

const useStyles = makeStyles(() => ({
  button: {
    justifyContent: 'flex-start',
    minWidth: 66,
  },
}));

export interface Handlers {
  onRemove: (domain: Domain) => void;
  onDisableOrEnable: (status: 'enable' | 'disable', domain: Domain) => void;
  onClone: (domain: Domain) => void;
  onEdit: (domain: Domain) => void;
}

interface Props extends Handlers {
  domain: Domain;
}

interface ExtendedAction extends Action {
  className?: string;
}

type CombinedProps = Props & Handlers;

export const DomainActionMenu: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { domain, onClone, onDisableOrEnable, onEdit, onRemove } = props;

  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const actions = [
    {
      title: 'Edit',
      onClick: () => {
        onEdit(domain);
      },
    },
    {
      title: domain.status === 'active' ? 'Disable' : 'Enable',
      className: classes.button,
      onClick: () => {
        onDisableOrEnable(
          domain.status === 'active' ? 'disable' : 'enable',
          domain
        );
      },
    },
    {
      title: 'Clone',
      onClick: () => {
        onClone(domain);
      },
    },
    {
      title: 'Delete',
      onClick: () => {
        onRemove(domain);
      },
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
              key={action.title}
              actionText={action.title}
              className={action.className}
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
