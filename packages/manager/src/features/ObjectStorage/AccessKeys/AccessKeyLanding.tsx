import { FormikBag } from 'formik';
import {
  createObjectStorageKeys,
  getObjectStorageKeys,
  ObjectStorageKeyRequest,
  revokeObjectStorageKey,
  updateObjectStorageKey
} from 'linode-js-sdk/lib/profile';
import * as React from 'react';
import { compose } from 'recompose';
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
import { useOpenClose } from 'src/hooks/useOpenClose';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import {
  sendCreateAccessKeyEvent,
  sendEditAccessKeyEvent,
  sendRevokeAccessKeyEvent
} from 'src/utilities/ga';
import AccessKeyDisplayDialog from './AccessKeyDisplayDialog';
import AccessKeyDrawer from './AccessKeyDrawer';
import AccessKeyTable from './AccessKeyTable';
import RevokeAccessKeyDialog from './RevokeAccessKeyDialog';

type ClassNames = 'headline';

const styles = (theme: Theme) =>
  createStyles({
    headline: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    }
  });

type Props = PaginationProps<Linode.ObjectStorageKey> & WithStyles<ClassNames>;

export type FormikProps = FormikBag<Props, ObjectStorageKeyRequest>;

export type MODES = 'creating' | 'editing';

export const AccessKeyLanding: React.StatelessComponent<Props> = props => {
  const { classes, ...paginationProps } = props;

  const [mode, setMode] = React.useState<MODES>('creating');

  // Key to display in Confirmation Modal upon creation
  const [
    keyToDisplay,
    setKeyToDisplay
  ] = React.useState<Linode.ObjectStorageKey | null>(null);

  // Key to rename (by clicking on a key's kebab menu )
  const [
    keyToEdit,
    setKeyToEdit
  ] = React.useState<Linode.ObjectStorageKey | null>(null);

  // Key to revoke (by clicking on a key's kebab menu )
  const [
    keyToRevoke,
    setKeyToRevoke
  ] = React.useState<Linode.ObjectStorageKey | null>(null);
  const [isRevoking, setIsRevoking] = React.useState<boolean>(false);
  const [revokeErrors, setRevokeErrors] = useErrors();

  const displayKeysDialog = useOpenClose();
  const revokeKeysDialog = useOpenClose();
  const createOrEditDrawer = useOpenClose();

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

        createOrEditDrawer.close();
        displayKeysDialog.open();

        // @analytics
        sendCreateAccessKeyEvent();
      })
      .catch(errorResponse => {
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
      return createOrEditDrawer.close();
    }

    setSubmitting(true);

    updateObjectStorageKey(keyToEdit.id, values)
      .then(_ => {
        setSubmitting(false);

        // "Refresh" keys to display the newly updated key
        paginationProps.request();

        createOrEditDrawer.close();

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

  const openDrawerForCreating = () => {
    setMode('creating');
    createOrEditDrawer.open();
  };

  const openDrawerForEditing = (objectStorageKey: Linode.ObjectStorageKey) => {
    setMode('editing');
    setKeyToEdit(objectStorageKey);
    createOrEditDrawer.open();
  };

  const openRevokeDialog = (objectStorageKey: Linode.ObjectStorageKey) => {
    setKeyToRevoke(objectStorageKey);
    revokeKeysDialog.open();
  };

  const closeRevokeDialog = () => {
    setRevokeErrors([]);
    revokeKeysDialog.close();
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Access Keys" />
      <Grid container justify="flex-end">
        <Grid item>
          <AddNewLink
            onClick={openDrawerForCreating}
            label="Create an Access Key"
          />
        </Grid>
      </Grid>

      <AccessKeyTable
        {...paginationProps}
        openDrawerForEditing={openDrawerForEditing}
        openRevokeDialog={openRevokeDialog}
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
        open={createOrEditDrawer.isOpen}
        onClose={createOrEditDrawer.close}
        onSubmit={mode === 'creating' ? handleCreateKey : handleEditKey}
        mode={mode}
        objectStorageKey={keyToEdit ? keyToEdit : undefined}
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
        errors={revokeErrors}
      />
    </React.Fragment>
  );
};

const styled = withStyles(styles);

const updatedRequest = (_: Props, params: any, filters: any) =>
  getObjectStorageKeys(params, filters);

const paginated = Pagey(updatedRequest);

const enhanced = compose<Props, {}>(
  styled,
  paginated
);

export default enhanced(AccessKeyLanding);
