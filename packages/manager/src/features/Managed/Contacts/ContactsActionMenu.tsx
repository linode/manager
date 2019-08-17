import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
// import { updateLinodeSettings } from 'src/services/managed';
// import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  contactId: number;
  updateOne: (contact: Linode.ManagedContact) => void;
  openDrawer: (contactId: number) => void;
}

export type CombinedProps = Props & WithSnackbarProps;

export const SSHAccessActionMenu: React.FC<CombinedProps> = props => {
  // const { contactId, updateOne, openDrawer, enqueueSnackbar } = props;
  const { contactId, openDrawer } = props;

  // const handleError = (message: string, error: Linode.ApiFieldError[]) => {
  //   const errMessage = getAPIErrorOrDefault(error, message);
  //   enqueueSnackbar(errMessage[0].reason, { variant: 'error' });
  // };

  const createActions = (closeMenu: Function): Action[] => {
    const actions = [
      {
        title: 'Delete',
        onClick: () => {
          alert('delete contact');
          // updateLinodeSettings(linodeId, {
          //   ssh: { access: true }
          // })
          //   .then(updatedLinodeSetting => {
          //     updateOne(updatedLinodeSetting);
          //     enqueueSnackbar('SSH Access disabled successfully.', {
          //       variant: 'success'
          //     });
          //   })
          //   .catch(err => {
          //     handleError('Error disabling SSH Access for this Linode.', err);
          //   });
          // closeMenu();
        }
      },
      {
        title: 'Edit',
        onClick: () => {
          closeMenu();
          openDrawer(contactId);
        }
      }
    ];
    return actions;
  };

  return <ActionMenu createActions={createActions} />;
};

const enhanced = compose<CombinedProps, Props>(withSnackbar);

export default enhanced(SSHAccessActionMenu);
