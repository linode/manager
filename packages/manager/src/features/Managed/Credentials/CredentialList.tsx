import { FormikBag } from 'formik';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableSortCell from 'src/components/TableSortCell';
import { useDialog } from 'src/hooks/useDialog';
import {
  createCredential,
  CredentialPayload,
  deleteCredential,
  updateCredential,
  updatePassword
} from 'src/services/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors
} from 'src/utilities/formikErrorUtils';

import { default as CredentialDialog } from '../Monitors/MonitorDialog';
import CredentialDrawer from './CredentialDrawer';
import CredentialTableContent from './CredentialTableContent';

const useStyles = makeStyles((theme: Theme) => ({
  subHeader: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

interface Props {
  error?: Linode.ApiFieldError[];
  credentials: Linode.ManagedCredential[];
  loading: boolean;
  update: () => void;
}

type CombinedProps = Props & WithSnackbarProps;

export type FormikProps = FormikBag<Props, CredentialPayload>;

export const CredentialList: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { credentials, enqueueSnackbar, error, loading, update } = props;
  const [isDrawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const [drawerMode, setDrawerMode] = React.useState<'create' | 'edit'>(
    'create'
  );
  const [editID, setEditID] = React.useState<number>(0);

  const {
    dialog,
    openDialog,
    closeDialog,
    submitDialog,
    handleError
  } = useDialog<number>(deleteCredential);

  const handleDelete = () => {
    submitDialog(dialog.entityID)
      .then(() => {
        update();
        enqueueSnackbar('Credential deleted successfully.', {
          variant: 'success'
        });
      })
      .catch(e =>
        handleError(
          getAPIErrorOrDefault(e, 'Error deleting this credential.')[0].reason
        )
      );
  };

  const handleSuccess = (cb: any) => {
    cb();
    setDrawerOpen(false);
    update();
  };

  const _handleError = (
    e: Linode.ApiFieldError[],
    setSubmitting: any,
    setErrors: any,
    setStatus: any,
    defaultMessage: string
  ) => {
    const mapErrorToStatus = (generalError: string) =>
      setStatus({ generalError });

    setSubmitting(false);
    handleFieldErrors(setErrors, e);
    handleGeneralErrors(mapErrorToStatus, e, defaultMessage);
    setSubmitting(false);
  };

  const handleCreate = (
    values: CredentialPayload,
    { setSubmitting, setErrors, setStatus }: FormikProps
  ) => {
    createCredential(values)
      .then(() => handleSuccess(() => setSubmitting(false)))
      .catch(e => {
        _handleError(
          e,
          setSubmitting,
          setErrors,
          setStatus,
          `Unable to create this Credential. Please try again later.`
        );
      });
  };

  const handleUpdate = (
    values: CredentialPayload,
    { setSubmitting, setErrors, setStatus }: FormikProps
  ) => {
    const thisCredential = credentials.find(c => c.id === editID);
    const promises = [];

    /**
     * Due to reasons, a PUT to /managed/credentials/id is only
     * able to update the credential's label. There is a separate endpoint,
     * /managed/credentials/id/update, which you can POST to in order to
     * update the password and or username. Since all fields are present in
     * the drawer, we need to use the standard Promise magic to combine
     * multiple requests. Here we first check if the user has input any values
     * or changes; if not, just exit. If the label is changed, do a PUT, and
     * in parallel do a POST if there have been password or username changes.
     */
    if (thisCredential && thisCredential.label !== values.label) {
      // Label has changed. Update it through /managed/credentials/editID
      promises.push(updateCredential(editID, { label: values.label }));
    }

    if (values.password || values.username) {
      // User has input a new password or username. Update through /update.
      promises.push(
        updatePassword(editID, {
          password: values.password,
          username: values.username
        })
      );
    }

    if (promises.length === 0) {
      // Nothing changed, let's get out of here while we still can.
      handleDrawerClose();
      setSubmitting(false);
      return;
    }

    Promise.all(promises)
      .then(() => {
        handleSuccess(() => setSubmitting(false));
        enqueueSnackbar('Credential updated successfully', {
          variant: 'success'
        });
      })
      .catch(err =>
        _handleError(
          err,
          setSubmitting,
          setErrors,
          setStatus,
          'Unable to update this Credential.'
        )
      );
  };

  const submitForm = (values: CredentialPayload, formikProps: FormikProps) => {
    switch (drawerMode) {
      case 'edit':
        return handleUpdate(values, formikProps);
      case 'create':
      default:
        return handleCreate(values, formikProps);
    }
  };

  const openForEdit = (credentialID: number) => {
    setDrawerMode('edit');
    setEditID(credentialID);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setEditID(0);
    setDrawerOpen(false);
    setDrawerMode('create');
  };

  return (
    <>
      <DocumentTitleSegment segment="Credentials" />
      <Grid
        container
        justify="flex-end"
        alignItems="flex-end"
        updateFor={[credentials, error, loading]}
      >
        <Grid item xs={12}>
          <Typography variant="subtitle1" className={classes.subHeader}>
            Please share any credentials our support team may need when
            responding to a service issue.
            <br /> Credentials are stored encrypted and all decryption attempts
            are logged. You can revoke credentials at any time by deleting them.
          </Typography>
        </Grid>
        <Grid item>
          <Grid container alignItems="flex-end">
            <Grid item className="pt0">
              <AddNewLink
                onClick={() => setDrawerOpen(true)}
                label="Add Credentials"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <OrderBy data={credentials} orderBy={'label'} order={'asc'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <Paginate data={orderedData}>
            {({
              data,
              count,
              handlePageChange,
              handlePageSizeChange,
              page,
              pageSize
            }) => (
              <>
                <Paper>
                  <Table aria-label="List of Your Managed Credentials">
                    <TableHead>
                      <TableRow>
                        <TableSortCell
                          active={orderBy === 'label'}
                          label={'label'}
                          direction={order}
                          handleClick={handleOrderChange}
                          data-qa-credential-label-header
                        >
                          Credential
                        </TableSortCell>
                        <TableSortCell
                          active={orderBy === 'last_decrypted'}
                          label={'last_decrypted'}
                          direction={order}
                          handleClick={handleOrderChange}
                          data-qa-credential-decrypted-header
                        >
                          Last Decrypted
                        </TableSortCell>
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <CredentialTableContent
                        credentials={data}
                        loading={loading}
                        error={error}
                        openDialog={openDialog}
                        openForEdit={openForEdit}
                      />
                    </TableBody>
                  </Table>
                </Paper>
                <PaginationFooter
                  count={count}
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  page={page}
                  pageSize={pageSize}
                  eventCategory="managed credential table"
                />
              </>
            )}
          </Paginate>
        )}
      </OrderBy>
      <CredentialDialog
        open={dialog.isOpen}
        label={dialog.entityLabel || ''}
        loading={dialog.isLoading}
        error={dialog.error}
        onClose={closeDialog}
        onDelete={handleDelete}
      />
      <CredentialDrawer
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        onSubmit={submitForm}
        mode={drawerMode}
        credential={credentials.find(c => c.id === editID)}
      />
    </>
  );
};

export default withSnackbar(CredentialList);
