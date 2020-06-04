import { Image } from '@linode/api-v4/lib/images';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onRestore: (imageID: string) => void;
  onDeploy: (imageID: string) => void;
  onEdit: (label: string, description: string, imageID: string) => void;
  onDelete: (label: string, imageID: string) => void;
  image: Image;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class ImagesActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const { onRestore, onDeploy, onEdit, onDelete, image } = this.props;

    return (): Action[] => {
      const actions = [
        {
          title: 'Restore to Existing Linode',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onRestore(image.id);
            e.preventDefault();
          }
        },
        {
          title: 'Deploy New Linode',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDeploy(image.id);
            e.preventDefault();
          }
        },
        {
          title: 'Edit',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            const description = image.description ? image.description : ' ';
            onEdit(image.label, description, image.id);
            e.preventDefault();
          }
        },
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDelete(image.label, image.id);
            e.preventDefault();
          }
        }
      ];

      return actions;
    };
  };

  render() {
    return (
      <ActionMenu
        createActions={this.createActions()}
        ariaLabel={`Action menu for Image ${this.props.image.label}`}
      />
    );
  }
}

export default withRouter(ImagesActionMenu);
