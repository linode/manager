import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import { updateLinodeSettings } from 'src/services/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  linodeId: number;
  access: boolean;
  requestSettings: () => void;
  openDrawer: (linodeId: number) => void;
}

export type CombinedProps = Props & WithSnackbarProps;

export const SSHAccessActionMenu: React.FC<CombinedProps> = props => {
  const {
    access,
    linodeId,
    enqueueSnackbar,
    requestSettings,
    openDrawer
  } = props;

  const createActions = (closeMenu: Function): Action[] => {
    const actions = [
      /**
       * Reminder of API oddity:
       * When linodeSetting.ssh.access === true, access is DISABLED
       * When linodeSetting.ssh.access === false, access is ENABLED
       * @todo: Change this if/when API is fixed.
       */
      {
        title: access ? 'Enable' : 'Disable',
        onClick: () => {
          updateLinodeSettings(linodeId, {
            ssh: { access: !access }
          })
            .then(() => requestSettings())
            .catch(err => {
              const errMessage = getAPIErrorOrDefault(
                err,
                `Error ${
                  access ? 'enabling' : 'disabling'
                } SSH access for this Linode.`
              );
              enqueueSnackbar(errMessage[0].reason, { variant: 'error' });
            });
          closeMenu();
        }
      },
      {
        title: 'Edit',
        onClick: () => {
          closeMenu();
          openDrawer(linodeId);
        }
      }
    ];
    return actions;
  };

  return <ActionMenu createActions={createActions} />;
};

const enhanced = compose<CombinedProps, Props>(withSnackbar);

export default enhanced(SSHAccessActionMenu);
