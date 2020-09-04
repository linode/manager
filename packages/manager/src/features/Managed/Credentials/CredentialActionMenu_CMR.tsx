import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import {
  makeStyles,
  Theme,
  useTheme,
  useMediaQuery
} from 'src/components/core/styles';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
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
  }
}));

export type CombinedProps = Props & WithSnackbarProps;

const CredentialActionMenu: React.FC<CombinedProps> = props => {
  const { label, credentialID, openDialog, openForEdit } = props;

  const classes = useStyles();

  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const onClickForEdit = () => {
    openForEdit(credentialID);
  };

  const onClickForDelete = () => {
    openDialog(credentialID, label);
  };

  const actions: Action[] = [
    {
      title: 'Edit',
      onClick: onClickForEdit
    },
    {
      title: 'Delete',
      onClick: onClickForDelete
    }
  ];

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {matchesSmDown ? (
        <ActionMenu
          createActions={() => actions}
          ariaLabel={`Action menu for Managed Credentials for ${label}`}
        />
      ) : (
        <div className={classes.actionInner}>
          {actions.map(action => {
            return (
              <InlineMenuAction
                key={action.title}
                actionText={action.title}
                onClick={action.onClick}
              />
            );
          })}
        </div>
      )}
    </>
  );
};

const enhanced = compose<CombinedProps, Props>(withSnackbar);

export default enhanced(CredentialActionMenu);
