import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu_CMR/';
import Hidden from 'src/components/core/Hidden';
import InlineMenuAction from 'src/components/InlineMenuAction';

export interface Props {
  onRemove: () => void;
  onDetails: () => void;
  label: string;
  cluster: string;
}

export const BucketActionMenu: React.FC<Props> = props => {
  const createActions = () => (): Action[] => {
    return [
      {
        title: 'Details',
        onClick: () => {
          props.onDetails();
        }
      },
      {
        title: 'Delete',
        onClick: () => {
          props.onRemove();
        }
      }
    ];
  };

  return (
    <>
      <Hidden smDown>
        <InlineMenuAction
          actionText="Details"
          onClick={() => {
            props.onDetails();
          }}
        />
        <InlineMenuAction
          actionText="Delete"
          onClick={() => {
            props.onRemove();
          }}
        />
      </Hidden>
      <Hidden mdUp>
        <ActionMenu
          createActions={createActions()}
          ariaLabel={`Action menu for Bucket ${props.label}`}
        />
      </Hidden>
    </>
  );
};

export default BucketActionMenu;
