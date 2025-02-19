import { APIError } from '@linode/api-v4/lib/types';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Action, ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { useUpdateLinodeSettingsMutation } from 'src/queries/managed/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

export interface SSHAccessActionMenuProps {
  isEnabled: boolean;
  linodeId: number;
  linodeLabel: string;
  openDrawer: (linodeId: number) => void;
}

export const SSHAccessActionMenu = (props: SSHAccessActionMenuProps) => {
  const { isEnabled, linodeId, openDrawer } = props;
  const theme = useTheme();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: updateLinodeSettings } = useUpdateLinodeSettingsMutation(
    linodeId
  );

  const handleError = (message: string, error: APIError[]) => {
    const errMessage = getAPIErrorOrDefault(error, message);
    enqueueSnackbar(errMessage[0].reason, { variant: 'error' });
  };

  const actions: Action[] = [
    {
      onClick: () => {
        openDrawer(linodeId);
      },
      title: 'Edit',
    },
    isEnabled
      ? {
          onClick: () => {
            updateLinodeSettings({
              ssh: { access: false },
            })
              .then(() => {
                enqueueSnackbar('SSH Access disabled successfully.', {
                  variant: 'success',
                });
              })
              .catch((err) => {
                handleError('Error disabling SSH Access for this Linode.', err);
              });
          },
          title: 'Disable',
        }
      : {
          onClick: () => {
            updateLinodeSettings({
              ssh: { access: true },
            })
              .then(() => {
                enqueueSnackbar('SSH Access enabled successfully.', {
                  variant: 'success',
                });
              })
              .catch((err) => {
                handleError('Error enabling SSH Access for this Linode.', err);
              });
          },
          title: 'Enable',
        },
  ];

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {matchesSmDown ? (
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for SSH Access key for Linode ${props.linodeLabel}`}
        />
      ) : (
        actions.map((action) => {
          return (
            <InlineMenuAction
              actionText={action.title}
              key={action.title}
              onClick={action.onClick}
            />
          );
        })
      )}
    </>
  );
};

export default SSHAccessActionMenu;
