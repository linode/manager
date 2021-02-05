import { Event } from '@linode/api-v4/lib/account';
import { splitAt } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
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

  const actions: Action[] = [
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
    },
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

  const splitActionsArrayIndex = matchesSmDown ? 0 : 2;
  const [inlineActions, menuActions] = splitAt(splitActionsArrayIndex, actions);

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
      <ActionMenu
        actionsList={menuActions}
        ariaLabel={`Action menu for Image ${props.label}`}
      />
    </>
  );
};

export default withRouter(ImagesActionMenu);
