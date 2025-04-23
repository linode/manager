import {
  useAccountSettings,
  useAllLinodesQuery,
  useMutateAccountSettings,
} from '@linode/queries';
import { CircleProgress, ErrorState, Stack } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { useIsLinodeInterfacesEnabled } from 'src/utilities/linodes';

import { BackupDrawer } from '../Backups';
import AutoBackups from './AutoBackups';
import CloseAccountSetting from './CloseAccountSetting';
import { DefaultFirewalls } from './DefaultFirewalls';
import { EnableManaged } from './EnableManaged';
import NetworkHelper from './NetworkHelper';
import { NetworkInterfaceType } from './NetworkInterfaceType';
import { ObjectStorageSettings } from './ObjectStorageSettings';

import type { APIError } from '@linode/api-v4';

const GlobalSettings = () => {
  const [isBackupsDrawerOpen, setIsBackupsDrawerOpen] = React.useState(false);

  const {
    data: accountSettings,
    error: accountSettingsError,
    isLoading: accountSettingsLoading,
  } = useAccountSettings();

  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();
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

  const { backups_enabled, managed, network_helper } = accountSettings;

  const toggleAutomaticBackups = () => {
    updateAccount({ backups_enabled: !backups_enabled }).catch(displayError);
  };

  const toggleNetworkHelper = () => {
    updateAccount({ network_helper: !network_helper }).catch(displayError);
  };

  return (
    <div>
      <DocumentTitleSegment segment="Settings" />
      <Stack spacing={2}>
        {isLinodeInterfacesEnabled && <NetworkInterfaceType />}
        {isLinodeInterfacesEnabled && <DefaultFirewalls />}
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
        <ObjectStorageSettings />
        <EnableManaged isManaged={managed} />
        <CloseAccountSetting />
        <BackupDrawer
          onClose={() => setIsBackupsDrawerOpen(false)}
          open={isBackupsDrawerOpen}
        />
      </Stack>
    </div>
  );
};

export default GlobalSettings;
