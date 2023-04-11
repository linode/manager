import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import * as React from 'react';
import InlineAction from 'src/components/InlineMenuAction';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(() => ({
  inlineActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
}));

interface Props {
  backup: DatabaseBackup;
  onRestore: (id: number) => void;
  onDelete: (id: number) => void;
}

export const DatabaseBackupActionMenu = (props: Props) => {
  const { classes } = useStyles();
  const { backup, onRestore, onDelete } = props;

  const actions = [
    {
      title: 'Restore',
      onClick: () => onRestore(backup.id),
    },
  ];

  // Prepend the Delete button only for manual backups
  if (backup.type === 'snapshot') {
    actions.unshift({
      title: 'Delete',
      onClick: () => onDelete(backup.id),
    });
  }

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
