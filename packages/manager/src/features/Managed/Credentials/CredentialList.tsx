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
  deleteCredential
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

  const submitForm = (
    values: CredentialPayload,
    { setSubmitting, setErrors, setStatus }: FormikProps
  ) => {
    createCredential(values)
      .then(_ => {
        setSubmitting(false);
        setDrawerOpen(false);
        update();
      })
      .catch(e => {
        const defaultMessage = `Unable to create this Credential. Please try again later.`;
        const mapErrorToStatus = (generalError: string) =>
          setStatus({ generalError });

        setSubmitting(false);
        handleFieldErrors(setErrors, e);
        handleGeneralErrors(mapErrorToStatus, e, defaultMessage);
        setSubmitting(false);
      });
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
        onClose={() => setDrawerOpen(false)}
        onSubmit={submitForm}
        mode="create"
      />
    </>
  );
};

export default withSnackbar(CredentialList);
