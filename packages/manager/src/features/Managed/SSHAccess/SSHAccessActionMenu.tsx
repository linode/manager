import {
  ManagedLinodeSetting,
  updateLinodeSettings,
} from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import ActionMenu, {
  Action,
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  linodeId: number;
  linodeLabel: string;
  isEnabled: boolean;
  updateOne: (linodeSetting: ManagedLinodeSetting) => void;
  openDrawer: (linodeId: number) => void;
}

export type CombinedProps = Props & WithSnackbarProps;

export const SSHAccessActionMenu: React.FC<CombinedProps> = (props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const { linodeId, isEnabled, updateOne, openDrawer, enqueueSnackbar } = props;

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
            updateLinodeSettings(linodeId, {
              ssh: { access: false },
            })
              .then((updatedLinodeSetting) => {
                updateOne(updatedLinodeSetting);
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
            updateLinodeSettings(linodeId, {
              ssh: { access: true },
            })
              .then((updatedLinodeSetting) => {
                updateOne(updatedLinodeSetting);
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

const enhanced = compose<CombinedProps, Props>(withSnackbar);

export default enhanced(SSHAccessActionMenu);
