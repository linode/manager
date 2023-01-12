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
  onDelete: (id: number) => void;
}

const DatabaseBackupActionMenu: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { backup, onDelete } = props;

  const actions = [
    {
      title: 'Delete',
      onClick: () => onDelete(backup.id),
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
