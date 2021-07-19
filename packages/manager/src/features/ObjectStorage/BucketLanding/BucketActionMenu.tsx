import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu/';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: 0,
  },
}));

export interface Props {
  onRemove: () => void;
  onDetails: () => void;
  label: string;
  cluster: string;
}

export const BucketActionMenu: React.FC<Props> = (props) => {
  const classes = useStyles();

  const actions: Action[] = [
    {
      title: 'Details',
      onClick: () => {
        props.onDetails();
      },
    },
    {
      title: 'Delete',
      onClick: () => {
        props.onRemove();
      },
    },
  ];

  return (
    <div className={classes.root}>
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
          actionsList={actions}
          ariaLabel={`Action menu for Bucket ${props.label}`}
        />
      </Hidden>
    </div>
  );
};

export default BucketActionMenu;
