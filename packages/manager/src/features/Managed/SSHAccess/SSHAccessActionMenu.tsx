import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import { updateLinodeSettings } from 'src/services/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  linodeId: number;
  isEnabled: boolean;
  requestSettings: () => void;
  openDrawer: (linodeId: number) => void;
}

export type CombinedProps = Props & WithSnackbarProps;

export const SSHAccessActionMenu: React.FC<CombinedProps> = props => {
  const {
    isEnabled,
    linodeId,
    enqueueSnackbar,
    requestSettings,
    openDrawer
  } = props;

  const createActions = (closeMenu: Function): Action[] => {
    const actions = [
      {
        title: isEnabled ? 'Disable' : 'Enable',
        onClick: () => {
          updateLinodeSettings(linodeId, {
            ssh: { access: isEnabled }
            // @todo: When API oddity is fixed, use the following instead:
            // ssh: { access: isEnabled ? false : true }
          })
            .then(() => requestSettings())
            .catch(err => {
              const errMessage = getAPIErrorOrDefault(
                err,
                `Error ${
                  isEnabled ? 'disabling' : 'enabling'
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
