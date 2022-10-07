import { CredentialPayload } from '@linode/api-v4/lib/managed/types';
import { APIError } from '@linode/api-v4/lib/types';
import { FormikBag } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import DeletionDialog from 'src/components/DeletionDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import { useDialog } from 'src/hooks/useDialog';
import {
  useAllManagedCredentialsQuery,
  useCreateCredentialMutation,
  useDeleteCredentialMutation,
  useUpdateCredentialMutation,
  useUpdateCredentialPasswordMutation,
} from 'src/queries/managed/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import {
  handleFieldErrors,
  handleGeneralErrors,
} from 'src/utilities/formikErrorUtils';
import AddCredentialDrawer from './AddCredentialDrawer';
import CredentialTableContent from './CredentialTableContent';
import UpdateCredentialDrawer from './UpdateCredentialDrawer';

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    fontSize: '0.875rem',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  },
  header: {
    margin: 0,
    width: '100%',
  },
  addNewWrapper: {
    '&.MuiGrid-item': {
      paddingTop: 0,
      paddingRight: 0,
    },
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(),
    },
  },
}));

export type FormikProps = FormikBag<{}, CredentialPayload>;

export const CredentialList = () => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { data, isLoading, error } = useAllManagedCredentialsQuery();

  const credentials = data || [];

  const { mutateAsync: createCredential } = useCreateCredentialMutation();
  const { mutateAsync: deleteCredential } = useDeleteCredentialMutation();

  // Creation drawer
  const [isCreateDrawerOpen, setDrawerOpen] = React.useState<boolean>(false);

  // Edit drawer (separate because the API requires two different endpoints for editing credentials)
  const [isEditDrawerOpen, setEditDrawerOpen] = React.useState<boolean>(false);
  const [editID, setEditID] = React.useState<number>(0);

  const { mutateAsync: updatePassword } = useUpdateCredentialPasswordMutation(
    editID
  );

  const { mutateAsync: updateCredential } = useUpdateCredentialMutation(editID);

  const {
    dialog,
    openDialog,
    closeDialog,
    submitDialog,
    handleError,
  } = useDialog<number>((id) => deleteCredential({ id: id || -1 }));

  const selectedCredential = credentials.find(
    (thisCredential) => thisCredential.id === editID
  );

  const handleDelete = () => {
    submitDialog(dialog.entityID)
      .then(() => {
        enqueueSnackbar('Credential deleted successfully.', {
          variant: 'success',
        });
      })
      .catch((e) =>
        handleError(
          getAPIErrorOrDefault(e, 'Error deleting this credential.')[0].reason
        )
      );
  };

  const _handleError = (
    e: APIError[],
    setSubmitting: any,
    setErrors: any,
    setStatus: any,
    defaultMessage: string
  ) => {
    const mapErrorToStatus = (generalError: string) =>
      setStatus({ generalError });

    handleFieldErrors(setErrors, e);
    handleGeneralErrors(mapErrorToStatus, e, defaultMessage);
    setSubmitting(false);
  };

  const handleCreate = (
    values: CredentialPayload,
    { setSubmitting, setErrors, setStatus }: FormikProps
  ) => {
    setStatus(undefined);
    createCredential(values)
      .then(() => {
        setDrawerOpen(false);
        setSubmitting(false);
      })
      .catch((e) => {
        _handleError(
          e,
          setSubmitting,
          setErrors,
          setStatus,
          `Unable to create this Credential. Please try again later.`
        );
      });
  };

  const handleUpdatePassword = (
    values: CredentialPayload,
    { setSubmitting, setErrors, setStatus, setFieldValue }: FormikProps
  ) => {
    setStatus(undefined);
    if (!selectedCredential) {
      return;
    }
    updatePassword({
      password: values.password || undefined,
      username: values.username || undefined,
    })
      .then(() => {
        setSubmitting(false);
        setStatus({ success: 'Updated successfully.' });
        setFieldValue('password', '');
        setFieldValue('username', '');
      })
      .catch((err) =>
        _handleError(
          err,
          setSubmitting,
          setErrors,
          setStatus,
          'Unable to update this Credential.'
        )
      );
  };

  const handleUpdateLabel = (
    values: CredentialPayload,
    { setSubmitting, setErrors, setStatus }: FormikProps
  ) => {
    setStatus(undefined);
    if (!selectedCredential) {
      return;
    }
    updateCredential({ label: values.label })
      .then(() => {
        setSubmitting(false);
        setStatus({ success: 'Label updated successfully.' });
      })
      .catch((err) =>
        _handleError(
          err,
          setSubmitting,
          setErrors,
          setStatus,
          'Unable to update this Credential.'
        )
      );
  };

  const openForEdit = (credentialID: number) => {
    setEditID(credentialID);
    setEditDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setEditID(0);
    setEditDrawerOpen(false);
  };

  return (
    <>
      <DocumentTitleSegment segment="Credentials" />
      <Typography className={classes.copy}>
        Please share any credentials our support team may need when responding
        to a service issue.
        <br /> Credentials are stored encrypted and all decryption attempts are
        logged. You can revoke credentials at any time by deleting them.
      </Typography>
      <Grid
        className={classes.header}
        container
        alignItems="center"
        justifyContent="flex-end"
        updateFor={[credentials, error, isLoading]}
      >
        <Grid className={classes.addNewWrapper} item>
          <AddNewLink
            label="Add Credential"
            onClick={() => setDrawerOpen(true)}
          />
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
              pageSize,
            }) => (
              <>
                <Table aria-label="List of Your Managed Credentials">
                  <TableHead>
                    <TableRow>
                      <TableSortCell
                        active={orderBy === 'label'}
                        label={'label'}
                        direction={order}
                        handleClick={handleOrderChange}
                        data-qa-credential-label-header
                        style={{ width: '30%' }}
                      >
                        Credential
                      </TableSortCell>
                      <TableSortCell
                        active={orderBy === 'last_decrypted'}
                        label={'last_decrypted'}
                        direction={order}
                        handleClick={handleOrderChange}
                        data-qa-credential-decrypted-header
                        style={{ width: '60%' }}
                      >
                        Last Decrypted
                      </TableSortCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <CredentialTableContent
                      credentials={data}
                      loading={isLoading}
                      error={error}
                      openDialog={openDialog}
                      openForEdit={openForEdit}
                    />
                  </TableBody>
                </Table>
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
      <DeletionDialog
        open={dialog.isOpen}
        entity="credential"
        label={dialog.entityLabel || ''}
        loading={dialog.isLoading}
        error={dialog.error}
        onClose={closeDialog}
        onDelete={handleDelete}
      />
      <AddCredentialDrawer
        open={isCreateDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleCreate}
      />
      <UpdateCredentialDrawer
        open={isEditDrawerOpen}
        label={selectedCredential ? selectedCredential.label : ''}
        onClose={handleDrawerClose}
        onSubmitLabel={handleUpdateLabel}
        onSubmitPassword={handleUpdatePassword}
      />
    </>
  );
};

export default CredentialList;
