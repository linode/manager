import * as React from 'react';
import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import { makeStyles } from 'src/components/core/styles';
import InlineAction from 'src/components/InlineMenuAction';

const useStyles = makeStyles(() => ({
  inlineActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
}));

interface Props {
  backup: DatabaseBackup;
}

type CombinedProps = Props;

const DatabaseBackupActionMenu: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  // @todo add actions functionality when API work is finalized
  const actions = [
    {
      title: 'Restore',
      onClick: () => {
        alert('Restore');
      },
    },
  ];

  return (
    <div className={classes.inlineActions}>
      {actions.map((thisAction) => (
        <InlineAction
          key={thisAction.title}
          actionText={thisAction.title}
          onClick={thisAction.onClick}
        />
      ))}
    </div>
  );
};

export default DatabaseBackupActionMenu;
