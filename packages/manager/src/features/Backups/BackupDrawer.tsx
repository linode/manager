import { Linode } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import { WithSnackbarProps, withSnackbar } from 'notistack';
import { isEmpty, path, pathOr } from 'ramda';
import * as React from 'react';
import { QueryClient } from 'react-query';
import { MapDispatchToProps, MapStateToProps, connect } from 'react-redux';
import { compose } from 'recompose';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { DisplayPrice } from 'src/components/DisplayPrice';
import Drawer from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import {
  WithAccountSettingsProps,
  withAccountSettings,
} from 'src/containers/accountSettings.container';
import {
  WithSpecificTypesProps,
  withSpecificTypes,
} from 'src/containers/types.container';
import {
  WithQueryClientProps,
  withQueryClient,
} from 'src/containers/withQueryClient.container';
import { ApplicationState } from 'src/store';
import {
  BackupError,
  enableAllBackups,
  enableAutoEnroll,
  handleAutoEnrollToggle,
  handleClose,
  handleResetError,
  handleResetSuccess,
} from 'src/store/backupDrawer';
import { getLinodesWithoutBackups } from 'src/store/selectors/getLinodesWithBackups';
import { ThunkDispatch } from 'src/store/types';
import { ExtendedType, extendType } from 'src/utilities/extendType';
import { isNotNullOrUndefined } from 'src/utilities/nullOrUndefined';
import { getTypeInfo } from 'src/utilities/typesHelpers';

import AutoEnroll from './AutoEnroll';
import BackupsTable from './BackupsTable';
import { ExtendedLinode, LinodeWithTypeInfo } from './types';

interface DispatchProps {
  actions: {
    close: () => void;
    dismissError: () => void;
    dismissSuccess: () => void;
    enable: () => void;
    enroll: (backupsEnabled: boolean, queryClient: QueryClient) => void;
    toggle: () => void;
  };
}

interface StateProps {
  autoEnroll: boolean;
  autoEnrollError?: string;
  backupLoadError: string;
  backupsLoading: boolean;
  enableErrors: BackupError[];
  enableSuccess: boolean;
  enabling: boolean;
  enrolling: boolean;
  linodesWithoutBackups: Linode[];
  loading: boolean;
  open: boolean;
  updatedCount: number;
}

type CombinedProps = DispatchProps &
  StateProps &
  WithSnackbarProps &
  WithSpecificTypesProps &
  WithQueryClientProps &
  WithAccountSettingsProps;

const getFailureNotificationText = (
  success: number,
  failed: number
): string => {
  if (success > 0) {
    const pluralizedSuccess = success > 1 ? 'Linodes' : 'Linode';
    const pluralizedFailure = failed > 1 ? 'Linodes' : 'Linode';
    return `Enabled backups successfully for ${success} ${pluralizedSuccess}
    , but ${failed} ${pluralizedFailure} failed.`;
  }
  // This function will only be called if at least one backup failed.
  else {
    return `There was an error enabling backups for your Linodes.`;
  }
};

export const getTotalPrice = (linodes: ExtendedLinode[]) => {
  return linodes.reduce((prevValue: number, linode: ExtendedLinode) => {
    return (
      prevValue +
      pathOr(0, ['typeInfo', 'addons', 'backups', 'price', 'monthly'], linode)
    );
  }, 0);
};
export class BackupDrawer extends React.Component<CombinedProps, {}> {
  componentDidMount(): void {
    this.updateRequestedTypes();
  }

  componentDidUpdate(prevProps: CombinedProps) {
    const { close, dismissSuccess } = this.props.actions;
    const { autoEnroll, enableSuccess, updatedCount } = this.props;
    if (enableSuccess) {
      const pluralizedLinodes =
        updatedCount > 1 ? 'Linodes have' : 'Linode has';
      const text = autoEnroll
        ? `${updatedCount} ${pluralizedLinodes} been enrolled in automatic backups, and
        all new Linodes will automatically be backed up.`
        : `${updatedCount} ${pluralizedLinodes} been enrolled in automatic backups.`;
      this.props.enqueueSnackbar(text, {
        variant: 'success',
      });
      dismissSuccess();
      close();
    }
    if (
      prevProps.linodesWithoutBackups.some(
        (linode, index) => linode != this.props.linodesWithoutBackups[index]
      )
    ) {
      this.updateRequestedTypes();
    }
  }

  render() {
    const {
      accountSettings,
      actions: { close, toggle },
      autoEnroll,
      autoEnrollError,
      enableErrors,
      enabling,
      enrolling,
      loading,
      open,
      requestedTypesData,
      updatedCount,
    } = this.props;

    const extendedTypeData = requestedTypesData.map(extendType);
    const extendedLinodes = enhanceLinodes(
      this.props.linodesWithoutBackups,
      enableErrors,
      extendedTypeData
    );
    const linodeCount = extendedLinodes.length;
    return (
      <Drawer onClose={close} open={open} title="Enable All Backups">
        <Grid container direction={'column'} spacing={2}>
          <Grid>
            <Typography variant="body1">
              Three backup slots are executed and rotated automatically: a daily
              backup, a 2-7 day old backup, and an 8-14 day old backup. See our
              {` `}
              <Link
                to={
                  'https://www.linode.com/docs/platform' +
                  '/disk-images/linode-backup-service/'
                }
              >
                guide on Backups
              </Link>{' '}
              for more information on features and limitations. Confirm to add
              backups to <strong data-qa-backup-count>{linodeCount}</strong>{' '}
              {linodeCount > 1 ? 'Linodes' : 'Linode'}.
            </Typography>
          </Grid>
          {enableErrors && !isEmpty(enableErrors) && (
            <Grid data-testid={'result-notice'}>
              <Notice error spacingBottom={0}>
                {getFailureNotificationText(updatedCount, enableErrors.length)}
              </Notice>
            </Grid>
          )}
          {/* Don't show this if the setting is already active. */}
          {!accountSettings.data?.backups_enabled && (
            <Grid>
              <AutoEnroll
                enabled={autoEnroll}
                error={autoEnrollError}
                toggle={toggle}
              />
            </Grid>
          )}
          <Grid>
            <DisplayPrice
              interval="mo"
              price={getTotalPrice(extendedLinodes)}
            />
          </Grid>
          <Grid>
            <ActionsPanel style={{ margin: 0, padding: 0 }}>
              <Button
                buttonType="secondary"
                className="cancel"
                data-qa-cancel
                data-testid={'cancel'}
                onClick={close}
              >
                Cancel
              </Button>
              <Button
                buttonType="primary"
                data-qa-submit
                data-testid={'submit'}
                loading={loading || enabling || enrolling}
                onClick={this.handleSubmit}
              >
                Confirm
              </Button>
            </ActionsPanel>
          </Grid>
          <Grid>
            <BackupsTable linodes={extendedLinodes} loading={loading} />
          </Grid>
        </Grid>
      </Drawer>
    );
  }

  handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    const {
      accountSettings,
      actions: { enable, enroll },
      queryClient,
    } = this.props;
    if (accountSettings.data?.backups_enabled) {
      enable();
    } else {
      enroll(accountSettings.data?.backups_enabled ?? false, queryClient);
    }
  };

  updateRequestedTypes = () => {
    this.props.setRequestedTypes(
      this.props.linodesWithoutBackups
        .map((linode) => linode.type)
        .filter(isNotNullOrUndefined)
    );
  };
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch
) => {
  return {
    actions: {
      close: () => dispatch(handleClose()),
      dismissError: () => dispatch(handleResetError()),
      dismissSuccess: () => dispatch(handleResetSuccess()),
      enable: () => dispatch(enableAllBackups()),
      enroll: (backupsEnabled: boolean, queryClient: QueryClient) =>
        dispatch(enableAutoEnroll({ backupsEnabled, queryClient })),
      toggle: () => dispatch(handleAutoEnrollToggle()),
    },
  };
};

/* Attaches a full type object to each Linode. Needed to calculate
 * price and label information in BackupsTable.tsx.
 */
export const addTypeInfo = (types: ExtendedType[], linodes: Linode[]) =>
  linodes.map((linode) => {
    const typeInfo = getTypeInfo(linode.type, types || []);
    return {
      ...linode,
      typeInfo,
    };
  });

/* Attaches an error object to each Linode */
export const addErrors = (
  errors: BackupError[],
  linodes: LinodeWithTypeInfo[]
) =>
  linodes.map((linode: LinodeWithTypeInfo) => {
    const linodeError = errors.find(
      (error) => Number(error.linodeId) === Number(linode.id)
    );
    return {
      ...linode,
      linodeError,
    };
  });

/* Add type and error info to each Linode, so that it's available when rendering each Linode later */
export const enhanceLinodes = (
  linodes: Linode[],
  errors: BackupError[],
  types: ExtendedType[]
) => {
  const linodesWithTypes = addTypeInfo(types, linodes);
  return addErrors(errors, linodesWithTypes);
};

const mapStateToProps: MapStateToProps<
  StateProps,
  CombinedProps,
  ApplicationState
> = (state: ApplicationState) => {
  const enableErrors = pathOr([], ['backups', 'enableErrors'], state);
  const linodes = getLinodesWithoutBackups(state.__resources);
  return {
    autoEnroll: pathOr(false, ['backups', 'autoEnroll'], state),
    autoEnrollError: path(['backups', 'autoEnrollError'], state),
    backupLoadError: pathOr('', ['backups', 'error'], state),
    backupsLoading: pathOr(false, ['backups', 'loading'], state),
    enableErrors,
    enableSuccess: pathOr(false, ['backups', 'enableSuccess'], state),
    enabling: pathOr(false, ['backups', 'enabling'], state),
    enrolling: pathOr(false, ['backups', 'enrolling'], state),
    linodesWithoutBackups: linodes,
    loading: pathOr(false, ['backups', 'loading'], state),
    open: pathOr(false, ['backups', 'open'], state),
    updatedCount: pathOr<number>(0, ['backups', 'updatedCount'], state),
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<CombinedProps, {}>(
  connected,
  // this awkward line avoids fetching all types until this dialog is opened
  (comp: React.ComponentType<CombinedProps>) => (props: CombinedProps) =>
    withSpecificTypes(comp, props.open)(props),
  withSnackbar,
  withAccountSettings,
  withQueryClient
);

export default enhanced(BackupDrawer);
