import {
  ManagedLinodeSetting,
  updateLinodeSettings
} from 'linode-js-sdk/lib/managed';
import { APIError } from 'linode-js-sdk/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  linodeId: number;
  linodeLabel: string;
  isEnabled: boolean;
  updateOne: (linodeSetting: ManagedLinodeSetting) => void;
  openDrawer: (linodeId: number) => void;
}

export type CombinedProps = Props & WithSnackbarProps;

export const SSHAccessActionMenu: React.FC<CombinedProps> = props => {
  const { linodeId, isEnabled, updateOne, openDrawer, enqueueSnackbar } = props;

  const handleError = (message: string, error: APIError[]) => {
    const errMessage = getAPIErrorOrDefault(error, message);
    enqueueSnackbar(errMessage[0].reason, { variant: 'error' });
  };

  const createActions = (closeMenu: Function): Action[] => {
    const actions = [
      isEnabled
        ? {
            title: 'Disable',
            onClick: () => {
              updateLinodeSettings(linodeId, {
                ssh: { access: false }
              })
                .then(updatedLinodeSetting => {
                  updateOne(updatedLinodeSetting);
                  enqueueSnackbar('SSH Access disabled successfully.', {
                    variant: 'success'
                  });
                })
                .catch(err => {
                  handleError(
                    'Error disabling SSH Access for this Linode.',
                    err
                  );
                });
              closeMenu();
            }
          }
        : {
            title: 'Enable',
            onClick: () => {
              updateLinodeSettings(linodeId, {
                ssh: { access: true }
              })
                .then(updatedLinodeSetting => {
                  updateOne(updatedLinodeSetting);
                  enqueueSnackbar('SSH Access enabled successfully.', {
                    variant: 'success'
                  });
                })
                .catch(err => {
                  handleError(
                    'Error enabling SSH Access for this Linode.',
                    err
                  );
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

  return (
    <ActionMenu
      createActions={createActions}
      ariaLabel={`Action menu for SSH Access key for Linode ${
        props.linodeLabel
      }`}
    />
  );
};

const enhanced = compose<CombinedProps, Props>(withSnackbar);

export default enhanced(SSHAccessActionMenu);
