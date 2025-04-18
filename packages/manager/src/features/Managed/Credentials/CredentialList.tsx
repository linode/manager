import { Button } from '@linode/ui';
import { useMatch, useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { DeletionDialog } from 'src/components/DeletionDialog/DeletionDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useDialogData } from 'src/hooks/useDialogData';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import {
  useAllManagedCredentialsQuery,
  useDeleteCredentialMutation,
  useManagedCredentialQuery,
  useUpdateCredentialMutation,
  useUpdateCredentialPasswordMutation,
} from 'src/queries/managed/managed';

import {
  StyledHeaderGrid,
  StyledTypography,
  StyledWrapperGrid,
} from '../Contacts/Contacts.styles';
import { handleManagedErrors } from '../utils';
import { AddCredentialDrawer } from './AddCredentialDrawer';
import CredentialTableContent from './CredentialTableContent';
import UpdateCredentialDrawer from './UpdateCredentialDrawer';

import type { CredentialPayload } from '@linode/api-v4/lib/managed/types';
import type { FormikBag } from 'formik';

export type FormikProps = FormikBag<{}, CredentialPayload>;

export const CredentialList = () => {
  const navigate = useNavigate();
  const match = useMatch({ strict: false });
  const { enqueueSnackbar } = useSnackbar();
  const {
    data,
    error: queryError,
    isLoading,
  } = useAllManagedCredentialsQuery();

  const credentials = data || [];

  const { data: selectedCredential, isFetching: isFetchingSelectedCredential } =
    useDialogData({
      enabled:
        match.routeId === '/managed/credentials/$credentialId/edit' ||
        match.routeId === '/managed/credentials/$credentialId/delete',
      paramKey: 'credentialId',
      queryHook: useManagedCredentialQuery,
      redirectToOnNotFound: '/managed/credentials',
    });

  const [deleteError, setDeleteError] = React.useState<string | undefined>();
  const { mutateAsync: deleteCredential } = useDeleteCredentialMutation();
  const { mutateAsync: updatePassword } = useUpdateCredentialPasswordMutation(
    selectedCredential?.id || -1
  );
  const { mutateAsync: updateCredential } = useUpdateCredentialMutation(
    selectedCredential?.id || -1
  );

  const {
    handleOrderChange,
    order,
    orderBy,
    sortedData: sortedCredentials,
  } = useOrderV2({
    data: credentials,
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'label',
      },
      from: '/managed/credentials',
    },
    preferenceKey: 'managed-credentials',
  });

  const handleDelete = () => {
    deleteCredential({ id: selectedCredential?.id || -1 })
      .then(() => {
        enqueueSnackbar('Credential deleted successfully.', {
          variant: 'success',
        });
        navigate({ to: '/managed/credentials' });
      })
      .catch((err) => {
        setDeleteError(err[0].reason || 'Unable to delete this Credential.');
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
      .catch((err) => {
        handleManagedErrors({
          apiError: err,
          defaultMessage: 'Unable to update this Credential.',
          setErrors,
          setStatus,
          setSubmitting,
        });
      });
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
      .catch((err) => {
        handleManagedErrors({
          apiError: err,
          defaultMessage: 'Unable to update this Credential.',
          setErrors,
          setStatus,
          setSubmitting,
        });
      });
  };

  const isAddDrawerOpen = match.routeId === '/managed/credentials/add';
  const isEditDrawerOpen =
    match.routeId === '/managed/credentials/$credentialId/edit';
  const isDeleteDialogOpen =
    match.routeId === '/managed/credentials/$credentialId/delete';

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
          <Button
            buttonType="primary"
            onClick={() => navigate({ to: '/managed/credentials/add' })}
            sx={{ mb: 1 }}
          >
            Add Credential
          </Button>
        </StyledWrapperGrid>
      </StyledHeaderGrid>
      <Paginate data={sortedCredentials || []}>
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
                  error={queryError}
                  loading={isLoading}
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
      <DeletionDialog
        onClose={() => {
          setDeleteError(undefined);
          navigate({ to: '/managed/credentials' });
        }}
        entity="credential"
        error={deleteError}
        label={selectedCredential?.label || ''}
        loading={isFetchingSelectedCredential}
        onDelete={handleDelete}
        open={isDeleteDialogOpen}
      />
      <AddCredentialDrawer
        onClose={() => navigate({ to: '/managed/credentials' })}
        open={isAddDrawerOpen}
      />
      <UpdateCredentialDrawer
        isFetching={isFetchingSelectedCredential}
        label={selectedCredential ? selectedCredential.label : ''}
        onClose={() => navigate({ to: '/managed/credentials' })}
        onSubmitLabel={handleUpdateLabel}
        onSubmitPassword={handleUpdatePassword}
        open={isEditDrawerOpen}
      />
    </>
  );
};
