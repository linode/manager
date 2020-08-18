import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction/InlineMenuAction';

interface Props {
  credentialID: number;
  label: string;
  openDialog: (id: number, label: string) => void;
  openForEdit: (id: number) => void;
}

const useStyles = makeStyles(() => ({
  actionInner: {
    display: 'flex',
    justifyContent: 'flex-end',
    '& a': {
      lineHeight: '1rem'
    }
  },
  action: {
    marginLeft: 10,
    padding: '12px 10px'
  }
}));

export type CombinedProps = Props & WithSnackbarProps;

const CredentialActionMenu: React.FC<CombinedProps> = props => {
  const { label, credentialID, openDialog, openForEdit } = props;

  const classes = useStyles();

  const inlineActions = [
    {
      actionText: 'Edit',
      className: classes.action,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        openForEdit(credentialID);
        // closeMenu();
        e.preventDefault();
      }
    },
    {
      actionText: 'Delete',
      className: classes.action,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        openDialog(credentialID, label);
        e.preventDefault();
      }
    }
  ];

  return (
    <div className={classes.actionInner}>
      {inlineActions.map(action => {
        return (
          <InlineMenuAction
            key={action.actionText}
            actionText={action.actionText}
            onClick={action.onClick}
          />
        );
      })}
    </div>
  );
};

const enhanced = compose<CombinedProps, Props>(withSnackbar);

export default enhanced(CredentialActionMenu);
