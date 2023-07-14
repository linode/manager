import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { Action } from 'src/components/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

const useStyles = makeStyles(() => ({
  root: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

interface Props {
  onCancelClick: () => void;
}

type CombinedProps = Props;

const TransfersPendingActionMenu: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const { onCancelClick } = props;

  const actions: Action[] = [
    {
      onClick: () => {
        onCancelClick();
      },
      title: 'Cancel',
    },
  ];

  return (
    <div className={classes.root}>
      {actions.map((action) => {
        return (
          <InlineMenuAction
            actionText={action.title}
            disabled={action.disabled}
            key={action.title}
            onClick={action.onClick}
          />
        );
      })}
    </div>
  );
};

export default TransfersPendingActionMenu;
