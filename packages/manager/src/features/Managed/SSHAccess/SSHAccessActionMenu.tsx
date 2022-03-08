import { APIError } from '@linode/api-v4/lib/types';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';
import { useUpdateLinodeSettingsMutation } from 'src/queries/managed/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

export interface Props {
  linodeId: number;
  linodeLabel: string;
  isEnabled: boolean;
  openDrawer: (linodeId: number) => void;
}

export const SSHAccessActionMenu: React.FC<Props> = (props) => {
  const { linodeId, isEnabled, openDrawer } = props;
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

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
      title: 'Edit',
      onClick: () => {
        openDrawer(linodeId);
      },
    },
    isEnabled
      ? {
          title: 'Disable',
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
        }
      : {
          title: 'Enable',
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

export default SSHAccessActionMenu;
