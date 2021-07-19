import * as React from 'react';
import { Action } from 'src/components/ActionMenu';
import { makeStyles } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
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
      title: 'Cancel',
      onClick: () => {
        onCancelClick();
      },
    },
  ];

  return (
    <div className={classes.root}>
      {actions.map((action) => {
        return (
          <InlineMenuAction
            key={action.title}
            actionText={action.title}
            onClick={action.onClick}
            disabled={action.disabled}
          />
        );
      })}
    </div>
  );
};

export default TransfersPendingActionMenu;
