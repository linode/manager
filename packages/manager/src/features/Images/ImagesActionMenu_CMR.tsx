import { Event } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import { Theme, useTheme, useMediaQuery } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

export interface Handlers {
  onRestore: (imageID: string) => void;
  onDeploy: (imageID: string) => void;
  onEdit: (label: string, description: string, imageID: string) => void;
  onDelete: (label: string, imageID: string) => void;
  [index: string]: any;
}

interface Props extends Handlers {
  description: string;
  event: Event;
  id: string;
  label: string;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export const ImagesActionMenu: React.FC<CombinedProps> = props => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    description,
    id,
    label,
    onRestore,
    onDeploy,
    onEdit,
    onDelete
  } = props;

  const inlineActions = [
    {
      actionText: 'Edit',
      onClick: () => {
        onEdit(label, description ?? ' ', id);
      }
    },
    {
      actionText: 'Deploy New Linode',
      onClick: () => {
        onDeploy(id);
      }
    }
  ];

  const createActions = () => (): Action[] => {
    const actions: Action[] = [
      {
        title: 'Restore to Existing Linode',
        onClick: () => {
          onRestore(id);
        }
      },
      {
        title: 'Delete',
        onClick: () => {
          onDelete(label, id);
        }
      }
    ];

    if (matchesSmDown) {
      actions.unshift(
        {
          title: 'Edit',
          onClick: () => {
            onEdit(label, description ?? ' ', id);
          }
        },
        {
          title: 'Deploy New Linode',
          onClick: () => {
            onDeploy(id);
          }
        }
      );
    }

    return actions;
  };

  return (
    <>
      {!matchesSmDown &&
        inlineActions.map(action => {
          return (
            <InlineMenuAction
              key={action.actionText}
              actionText={action.actionText}
              onClick={action.onClick}
            />
          );
        })}
      <ActionMenu
        createActions={createActions()}
        ariaLabel={`Action menu for Image ${props.label}`}
      />
    </>
  );
};

export default withRouter(ImagesActionMenu);
