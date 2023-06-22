import { APIError } from '@linode/api-v4/lib/types';
import { useSnackbar } from 'notistack';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { ApplicationState } from 'src/store';
import { handleOpen } from 'src/store/backupDrawer';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import AutoBackups from './AutoBackups';
import { EnableManaged } from './EnableManaged';
import EnableObjectStorage from './EnableObjectStorage';
import NetworkHelper from './NetworkHelper';
import CloseAccountSetting from './CloseAccountSetting';
import {
  useAccountSettings,
  useMutateAccountSettings,
} from 'src/queries/accountSettings';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';

interface DispatchProps {
  actions: {
    openBackupsDrawer: () => void;
  };
}

type Props = DispatchProps;

const GlobalSettings = (props: Props) => {
  const {
    actions: { openBackupsDrawer },
  } = props;

  const {
    data: accountSettings,
    isLoading: accountSettingsLoading,
    error: accountSettingsError,
  } = useAccountSettings();

  const { data: linodes } = useAllLinodesQuery();

  const linodesWithoutBackups =
    linodes?.filter((linode) => !linode.backups.enabled) ?? [];

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
        isManagedCustomer={managed}
        backups_enabled={backups_enabled}
        onChange={toggleAutomaticBackups}
        openBackupsDrawer={openBackupsDrawer}
        hasLinodesWithoutBackups={!isEmpty(linodesWithoutBackups)}
      />
      <NetworkHelper
        onChange={toggleNetworkHelper}
        networkHelperEnabled={network_helper}
      />
      <EnableObjectStorage object_storage={object_storage} />
      <EnableManaged isManaged={managed} />
      <CloseAccountSetting />
    </div>
  );
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => {
  return {
    actions: {
      openBackupsDrawer: () => dispatch(handleOpen()),
    },
  };
};

const connected = connect(undefined, mapDispatchToProps);

export default connected(GlobalSettings);
