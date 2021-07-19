import { DomainStatus } from '@linode/api-v4/lib/domains';
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

interface ExtendedAction extends Action {
  className?: string;
}

type CombinedProps = Props;

export const DomainActionMenu: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

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

  const actions = [
    {
      title: 'Edit',
      onClick: () => {
        handleEdit();
      },
    },
    {
      title: status === 'active' ? 'Disable' : 'Enable',
      className: classes.button,
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
