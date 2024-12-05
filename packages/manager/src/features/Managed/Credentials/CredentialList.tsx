import { Button } from '@linode/ui';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { DeletionDialog } from 'src/components/DeletionDialog/DeletionDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
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

import {
  StyledHeaderGrid,
  StyledTypography,
  StyledWrapperGrid,
} from '../Contacts/Contacts.styles';
import AddCredentialDrawer from './AddCredentialDrawer';
import CredentialTableContent from './CredentialTableContent';
import UpdateCredentialDrawer from './UpdateCredentialDrawer';

import type { CredentialPayload } from '@linode/api-v4/lib/managed/types';
import type { APIError } from '@linode/api-v4/lib/types';
import type { FormikBag } from 'formik';

export type FormikProps = FormikBag<{}, CredentialPayload>;

export const CredentialList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { data, error, isLoading } = useAllManagedCredentialsQuery();

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
    closeDialog,
    dialog,
    handleError,
    openDialog,
    submitDialog,
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
    { setErrors, setStatus, setSubmitting }: FormikProps
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
    { setErrors, setFieldValue, setStatus, setSubmitting }: FormikProps
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
    { setErrors, setStatus, setSubmitting }: FormikProps
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
      <StyledTypography>
        Please share any credentials our support team may need when responding
        to a service issue.
        <br /> Credentials are stored encrypted and all decryption attempts are
        logged. You can revoke credentials at any time by deleting them.
      </StyledTypography>
      <StyledHeaderGrid
        alignItems="center"
        container
        justifyContent="flex-end"
        spacing={2}
      >
        <StyledWrapperGrid>
          <Button buttonType="primary" onClick={() => setDrawerOpen(true)}>
            Add Credential
          </Button>
        </StyledWrapperGrid>
      </StyledHeaderGrid>
      <OrderBy data={credentials} order={'asc'} orderBy={'label'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <Paginate data={orderedData}>
            {({
              count,
              data,
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
                        data-qa-credential-label-header
                        direction={order}
                        handleClick={handleOrderChange}
                        label={'label'}
                        style={{ width: '30%' }}
                      >
                        Credential
                      </TableSortCell>
                      <TableSortCell
                        active={orderBy === 'last_decrypted'}
                        data-qa-credential-decrypted-header
                        direction={order}
                        handleClick={handleOrderChange}
                        label={'last_decrypted'}
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
                      error={error}
                      loading={isLoading}
                      openDialog={openDialog}
                      openForEdit={openForEdit}
                    />
                  </TableBody>
                </Table>
                <PaginationFooter
                  count={count}
                  eventCategory="managed credential table"
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  page={page}
                  pageSize={pageSize}
                />
              </>
            )}
          </Paginate>
        )}
      </OrderBy>
      <DeletionDialog
        entity="credential"
        error={dialog.error}
        label={dialog.entityLabel || ''}
        loading={dialog.isLoading}
        onClose={closeDialog}
        onDelete={handleDelete}
        open={dialog.isOpen}
      />
      <AddCredentialDrawer
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleCreate}
        open={isCreateDrawerOpen}
      />
      <UpdateCredentialDrawer
        label={selectedCredential ? selectedCredential.label : ''}
        onClose={handleDrawerClose}
        onSubmitLabel={handleUpdateLabel}
        onSubmitPassword={handleUpdatePassword}
        open={isEditDrawerOpen}
      />
    </>
  );
};

export default CredentialList;
