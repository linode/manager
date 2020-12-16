import { AccountSettings } from '@linode/api-v4/lib/account';
import {
  createObjectStorageKeys,
  getObjectStorageKeys,
  ObjectStorageKey,
  ObjectStorageKeyRequest,
  revokeObjectStorageKey,
  updateObjectStorageKey
} from '@linode/api-v4/lib/object-storage';
import { FormikBag } from 'formik';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import AddNewLink from 'src/components/AddNewLink';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import { useErrors } from 'src/hooks/useErrors';
import useFlags from 'src/hooks/useFlags';
import { useOpenClose } from 'src/hooks/useOpenClose';
import { ApplicationState } from 'src/store';
import { requestAccountSettings } from 'src/store/accountSettings/accountSettings.requests';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import {
  sendCreateAccessKeyEvent,
  sendEditAccessKeyEvent,
  sendRevokeAccessKeyEvent
} from 'src/utilities/ga';
import AccessKeyDisplayDialog from './AccessKeyDisplayDialog';
import AccessKeyDrawer from './AccessKeyDrawer';
import AccessKeyTable from './AccessKeyTable';
import AccessKeyTable_CMR from './AccessKeyTable_CMR';
import RevokeAccessKeyDialog from './RevokeAccessKeyDialog';
import { MODE, OpenAccessDrawer } from './types';
import ViewPermissionsDrawer from './ViewPermissionsDrawer';

type ClassNames = 'headline';

const styles = (theme: Theme) =>
  createStyles({
    headline: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    }
  });

interface Props {
  isRestrictedUser: boolean;
  accessDrawerOpen: boolean;
  openAccessDrawer: (mode: MODE) => void;
  closeAccessDrawer: () => void;
  mode: MODE;
}

export type FormikProps = FormikBag<CombinedProps, ObjectStorageKeyRequest>;

interface ReduxStateProps {
  object_storage: AccountSettings['object_storage'];
}

interface DispatchProps {
  requestSettings: () => Promise<AccountSettings>;
}

type CombinedProps = Props &
  PaginationProps<ObjectStorageKey> &
  WithStyles<ClassNames> &
  ReduxStateProps &
  DispatchProps;

export const AccessKeyLanding: React.FC<CombinedProps> = props => {
  const {
    object_storage,
    requestSettings,
    closeAccessDrawer,
    openAccessDrawer,
    mode,
    accessDrawerOpen,
    ...paginationProps
  } = props;

  const flags = useFlags();

  // Key to display in Confirmation Modal upon creation
  const [
    keyToDisplay,
    setKeyToDisplay
  ] = React.useState<ObjectStorageKey | null>(null);

  // Key to rename (by clicking on a key's kebab menu )
  const [keyToEdit, setKeyToEdit] = React.useState<ObjectStorageKey | null>(
    null
  );

  // Key to revoke (by clicking on a key's kebab menu )
  const [keyToRevoke, setKeyToRevoke] = React.useState<ObjectStorageKey | null>(
    null
  );
  const [isRevoking, setIsRevoking] = React.useState<boolean>(false);
  const [revokeErrors, setRevokeErrors] = useErrors();

  const displayKeysDialog = useOpenClose();
  const revokeKeysDialog = useOpenClose();
  const viewPermissionsDrawer = useOpenClose();

  // Request object storage key when component is first rendered
  React.useEffect(() => {
    paginationProps.request();
  }, []);

  const handleCreateKey = (
    values: ObjectStorageKeyRequest,
    { setSubmitting, setErrors, setStatus }: FormikProps
  ) => {
    // Clear out status (used for general errors)
    setStatus(null);
    setSubmitting(true);

    createObjectStorageKeys(values)
      .then(data => {
        setSubmitting(false);

        setKeyToDisplay(data);

        // "Refresh" keys to include the newly created key
        paginationProps.request();

        props.closeAccessDrawer();
        displayKeysDialog.open();

        // If our Redux Store says that the user doesn't have OBJ enabled,
        // it probably means they have just enabled it with the creation
        // of this key. In that case, update the Redux Store so that
        // subsequently created keys don't need to go through the
        // confirmation flow.
        if (object_storage === 'disabled') {
          requestSettings();
        }

        // @analytics
        sendCreateAccessKeyEvent();
      })
      .catch(errorResponse => {
        // We also need to refresh account settings on failure, since, depending
        // on the error, Object Storage service might have actually been enabled.
        if (object_storage === 'disabled') {
          requestSettings();
        }

        setSubmitting(false);

        const errors = getAPIErrorOrDefault(
          errorResponse,
          'There was an issue creating your Access Key.'
        );
        const mappedErrors = getErrorMap(['label'], errors);

        // `status` holds general errors
        if (mappedErrors.none) {
          setStatus(mappedErrors.none);
        }

        setErrors(mappedErrors);
      });
  };

  const handleEditKey = (
    values: ObjectStorageKeyRequest,
    { setSubmitting, setErrors, setStatus }: FormikProps
  ) => {
    // This shouldn't happen, but just in case.
    if (!keyToEdit) {
      return;
    }

    // Clear out status (used for general errors)
    setStatus(null);

    // If the new label is the same as the old one, no need to make an API
    // request. Just close the drawer and return early.
    if (values.label === keyToEdit.label) {
      return closeAccessDrawer();
    }

    setSubmitting(true);

    updateObjectStorageKey(keyToEdit.id, values)
      .then(_ => {
        setSubmitting(false);

        // "Refresh" keys to display the newly updated key
        paginationProps.request();

        closeAccessDrawer();

        // @analytics
        sendEditAccessKeyEvent();
      })
      .catch(errorResponse => {
        setSubmitting(false);

        const errors = getAPIErrorOrDefault(
          errorResponse,
          'There was an issue updating your Access Key.'
        );
        const mappedErrors = getErrorMap(['label'], errors);

        // `status` holds general errors
        if (mappedErrors.none) {
          setStatus(mappedErrors.none);
        }

        setErrors(mappedErrors);
      });
  };

  const handleRevokeKeys = () => {
    // This shouldn't happen, but just in case.
    if (!keyToRevoke) {
      return;
    }

    setIsRevoking(true);
    setRevokeErrors([]);

    revokeObjectStorageKey(keyToRevoke.id)
      .then(_ => {
        setIsRevoking(false);

        // "Refresh" keys to remove the newly revoked key
        paginationProps.request();

        revokeKeysDialog.close();

        // @analytics
        sendRevokeAccessKeyEvent();
      })
      .catch(errorResponse => {
        setIsRevoking(false);

        const errors = getAPIErrorOrDefault(
          errorResponse,
          'There was an issue revoking your Access Key.'
        );
        setRevokeErrors(errors);
      });
  };

  const openDrawer: OpenAccessDrawer = (
    mode: MODE,
    objectStorageKey: ObjectStorageKey | null = null
  ) => {
    setKeyToEdit(objectStorageKey);
    switch (mode) {
      case 'creating':
      case 'editing':
        openAccessDrawer(mode);
        break;
      case 'viewing':
        viewPermissionsDrawer.open();
    }
  };

  const openRevokeDialog = (objectStorageKey: ObjectStorageKey) => {
    setKeyToRevoke(objectStorageKey);
    revokeKeysDialog.open();
  };

  const closeRevokeDialog = () => {
    setRevokeErrors([]);
    revokeKeysDialog.close();
  };

  const KeyTable = flags.cmr ? AccessKeyTable_CMR : AccessKeyTable;

  return (
    <div>
      <DocumentTitleSegment segment="Access Keys" />
      {!flags.cmr && (
        <Grid container justify="flex-end">
          <Grid item>
            <AddNewLink
              onClick={() => openDrawer('creating')}
              label="Create an Access Key"
            />
          </Grid>
        </Grid>
      )}
      <KeyTable
        {...paginationProps}
        openDrawer={openDrawer}
        openRevokeDialog={openRevokeDialog}
        data-qa-access-key-table
      />

      <PaginationFooter
        page={props.page}
        pageSize={props.pageSize}
        count={props.count}
        handlePageChange={props.handlePageChange}
        handleSizeChange={props.handlePageSizeChange}
        eventCategory="object storage keys table"
      />

      <AccessKeyDrawer
        open={accessDrawerOpen}
        onClose={closeAccessDrawer}
        onSubmit={mode === 'creating' ? handleCreateKey : handleEditKey}
        mode={mode}
        objectStorageKey={keyToEdit ? keyToEdit : undefined}
        isRestrictedUser={props.isRestrictedUser}
      />

      <ViewPermissionsDrawer
        open={viewPermissionsDrawer.isOpen}
        onClose={viewPermissionsDrawer.close}
        objectStorageKey={keyToEdit}
      />

      <AccessKeyDisplayDialog
        objectStorageKey={keyToDisplay}
        isOpen={displayKeysDialog.isOpen}
        close={displayKeysDialog.close}
      />
      <RevokeAccessKeyDialog
        isOpen={revokeKeysDialog.isOpen}
        label={(keyToRevoke && keyToRevoke.label) || ''}
        handleClose={closeRevokeDialog}
        handleSubmit={handleRevokeKeys}
        isLoading={isRevoking}
        numAccessKeys={pathOr<number>(0, ['data', 'length'], paginationProps)}
        errors={revokeErrors}
      />
    </div>
  );
};

const styled = withStyles(styles);

const updatedRequest = (_: CombinedProps, params: any, filters: any) =>
  getObjectStorageKeys(params, filters);

const paginated = Pagey(updatedRequest);

const mapStateToProps = (state: ApplicationState) => {
  return {
    object_storage: pathOr<AccountSettings['object_storage']>(
      'disabled',
      ['data', 'object_storage'],
      state.__resources.accountSettings
    )
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => {
  return {
    requestSettings: () => dispatch(requestAccountSettings())
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<CombinedProps, Props>(styled, paginated, connected);

export default enhanced(AccessKeyLanding);
