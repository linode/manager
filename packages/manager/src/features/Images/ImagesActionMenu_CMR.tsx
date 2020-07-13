import { Event } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';

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
  const createActions = () => {
    const {
      description,
      id,
      label,
      onRestore,
      onDeploy,
      onEdit,
      onDelete
    } = props;

    return (): Action[] => {
      return [
        {
          title: 'Restore to Existing Linode',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onRestore(id);
            e.preventDefault();
          }
        },
        {
          title: 'Deploy New Linode',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDeploy(id);
            e.preventDefault();
          }
        },
        {
          title: 'Edit',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onEdit(label, description ?? ' ', id);
            e.preventDefault();
          }
        },
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDelete(label, id);
            e.preventDefault();
          }
        }
      ];
    };
  };

  return (
    <ActionMenu
      createActions={createActions()}
      ariaLabel={`Action menu for Image ${props.label}`}
    />
  );
};

export default withRouter(ImagesActionMenu);
