import { APIError } from '@linode/api-v4/lib/types';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import {
  useAccountSettings,
  useMutateAccountSettings,
} from 'src/queries/accountSettings';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { BackupDrawer } from '../Backups';
import AutoBackups from './AutoBackups';
import CloseAccountSetting from './CloseAccountSetting';
import { EnableManaged } from './EnableManaged';
import EnableObjectStorage from './EnableObjectStorage';
import NetworkHelper from './NetworkHelper';

const GlobalSettings = () => {
  const [isBackupsDrawerOpen, setIsBackupsDrawerOpen] = React.useState(false);

  const {
    data: accountSettings,
    error: accountSettingsError,
    isLoading: accountSettingsLoading,
  } = useAccountSettings();

  const { data: linodes } = useAllLinodesQuery();

  const hasLinodesWithoutBackups =
    linodes?.some((linode) => !linode.backups.enabled) ?? false;

  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: updateAccount } = useMutateAccountSettings();

  const displayError = (errors: APIError[] | undefined) => {
    if (!errors) {
      return;
    }
    const errorText = getAPIErrorOrDefault(
      errors,
      'There was an error updating your account settings.'
    )[0].reason;

    return enqueueSnackbar(errorText, {
      variant: 'error',
    });
  };

  if (accountSettingsLoading) {
    return <CircleProgress />;
  }

  if (accountSettingsError) {
    return (
      <ErrorState
        errorText={'There was an error retrieving your account data.'}
      />
    );
  }

  if (!accountSettings) {
    return null;
  }

  const {
    backups_enabled,
    managed,
    network_helper,
    object_storage,
  } = accountSettings;

  const toggleAutomaticBackups = () => {
    updateAccount({ backups_enabled: !backups_enabled }).catch(displayError);
  };

  const toggleNetworkHelper = () => {
    updateAccount({ network_helper: !network_helper }).catch(displayError);
  };

  return (
    <div>
      <AutoBackups
        backups_enabled={backups_enabled}
        hasLinodesWithoutBackups={hasLinodesWithoutBackups}
        isManagedCustomer={managed}
        onChange={toggleAutomaticBackups}
        openBackupsDrawer={() => setIsBackupsDrawerOpen(true)}
      />
      <NetworkHelper
        networkHelperEnabled={network_helper}
        onChange={toggleNetworkHelper}
      />
      <EnableObjectStorage object_storage={object_storage} />
      <EnableManaged isManaged={managed} />
      <CloseAccountSetting />
      <BackupDrawer
        onClose={() => setIsBackupsDrawerOpen(false)}
        open={isBackupsDrawerOpen}
      />
    </div>
  );
};

export default GlobalSettings;
