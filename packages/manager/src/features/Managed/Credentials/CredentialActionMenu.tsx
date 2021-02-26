import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import ActionMenu, {
  Action,
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

interface Props {
  credentialID: number;
  label: string;
  openDialog: (id: number, label: string) => void;
  openForEdit: (id: number) => void;
}

export type CombinedProps = Props & WithSnackbarProps;

const CredentialActionMenu: React.FC<CombinedProps> = props => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const { label, credentialID, openDialog, openForEdit } = props;

  const onClickForEdit = () => {
    openForEdit(credentialID);
  };

  const onClickForDelete = () => {
    openDialog(credentialID, label);
  };

  const actions: Action[] = [
    {
      title: 'Edit',
      onClick: onClickForEdit,
    },
    {
      title: 'Delete',
      onClick: onClickForDelete,
    },
  ];

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {matchesSmDown ? (
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for Managed Credentials for ${label}`}
        />
      ) : (
        actions.map(action => {
          return (
            <InlineMenuAction
              key={action.title}
              actionText={action.title}
              onClick={action.onClick}
            />
          );
        })
      )}
    </>
  );
};

const enhanced = compose<CombinedProps, Props>(withSnackbar);

export default enhanced(CredentialActionMenu);
