import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

const useStyles = makeStyles()(() => ({
  inlineActions: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

interface Props {
  backup: DatabaseBackup;
  disabled?: boolean;
  onRestore: (id: number) => void;
}

const DatabaseBackupActionMenu = (props: Props) => {
  const { classes } = useStyles();
  const { backup, disabled, onRestore } = props;

  const actions = [
    {
      onClick: () => onRestore(backup.id),
      title: 'Restore',
    },
  ];

  return (
    <div className={classes.inlineActions}>
      {actions.map((thisAction) => (
        <InlineMenuAction
          actionText={thisAction.title}
          disabled={disabled}
          key={thisAction.title}
          onClick={thisAction.onClick}
        />
      ))}
    </div>
  );
};

export default DatabaseBackupActionMenu;
