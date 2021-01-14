import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import ActionMenu from 'src/components/ActionMenu_CMR';
import Hidden from 'src/components/core/Hidden';
import InlineAction from 'src/components/InlineMenuAction';
import { DatabaseBackup } from '@linode/api-v4/lib/databases';

const useStyles = makeStyles((theme: Theme) => ({
  inlineActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  button: {
    ...theme.applyLinkStyles,
    color: theme.cmrTextColors.linkActiveLight,
    height: '100%',
    minWidth: 'auto',
    padding: '12px 10px',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: '#3683dc',
      color: '#ffffff'
    },
    '&[disabled]': {
      color: '#cdd0d5',
      cursor: 'default',
      '&:hover': {
        backgroundColor: 'inherit'
      }
    }
  }
}));

interface Props {
  backup: DatabaseBackup;
}

type CombinedProps = Props;

const DatabaseBackupActionMenu: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  // @todo add actions functionality when API work is finalized
  const actions = [
    {
      title: 'Restore',
      onClick: () => {
        alert('Restore');
      }
    }
  ];

  return (
    <div className={classes.inlineActions}>
      <Hidden smDown>
        {actions.map(thisAction => (
          <InlineAction
            key={thisAction.title}
            actionText={thisAction.title}
            onClick={thisAction.onClick}
          />
        ))}
      </Hidden>
      <Hidden mdUp>
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for database backup ${props.backup.id}`}
        />
      </Hidden>
    </div>
  );
};

export default DatabaseBackupActionMenu;
