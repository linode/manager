import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import * as React from 'react';
import InlineAction from 'src/components/InlineMenuAction';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(() => ({
  inlineActions: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

interface Props {
  backup: DatabaseBackup;
  onRestore: (id: number) => void;
}

const DatabaseBackupActionMenu = (props: Props) => {
  const { classes } = useStyles();
  const { backup, onRestore } = props;

  const actions = [
    {
      onClick: () => onRestore(backup.id),
      title: 'Restore',
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
