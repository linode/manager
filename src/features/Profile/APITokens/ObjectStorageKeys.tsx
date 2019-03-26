import { FormikBag } from 'formik';
import * as React from 'react';
import { compose } from 'recompose';
import AddNewLink from 'src/components/AddNewLink';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import { useErrors } from 'src/hooks/useErrors';
import { useOpenClose } from 'src/hooks/useOpenClose';
import {
  CreateObjectStorageKeyRequest,
  createObjectStorageKeys,
  getObjectStorageKeys,
  revokeObjectStorageKey
} from 'src/services/profile/objectStorageKeys';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import ObjectStorageKeyDisplayDialog from './ObjectStorageDisplayDialog';
import ObjectStorageDrawer from './ObjectStorageDrawer';
import ObjectStorageKeyTable from './ObjectStorageKeyTable';
import ObjectStorageRevokeKeysDialog from './ObjectStorageRevokeKeysDialog';

type ClassNames = 'headline';

const styles: StyleRulesCallback<ClassNames> = theme => {
  return {
    headline: {
      marginTop: theme.spacing.unit * 2,
      marginBottom: theme.spacing.unit * 2
    }
  };
};

type Props = PaginationProps<Linode.ObjectStorageKey> & WithStyles<ClassNames>;

export type FormikProps = FormikBag<Props, CreateObjectStorageKeyRequest>;

export const ObjectStorageKeys: React.StatelessComponent<Props> = props => {
  const { classes, ...paginationProps } = props;

  // Key to display in Confirmation Modal upon creation
  const [
    keyToDisplay,
    setKeyToDisplay
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
  const createDrawer = useOpenClose();

  // Request object storage key when component is first rendered
  React.useEffect(() => {
    paginationProps.request();
  }, []);

  const handleSubmit = (
    values: CreateObjectStorageKeyRequest,
    { setSubmitting, setErrors, setStatus }: FormikProps
  ) => {
    setSubmitting(true);

    createObjectStorageKeys(values)
      .then(data => {
        setSubmitting(false);

        setKeyToDisplay(data);

        // "Refresh" keys to include the newly created key
        paginationProps.request();

        createDrawer.close();
        displayKeysDialog.open();
      })
      .catch(errorResponse => {
        setSubmitting(false);

        const errors = getAPIErrorOrDefault(
          errorResponse,
          'There was an issue creating Object Storage Keys.'
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

    revokeObjectStorageKey(keyToRevoke.id)
      .then(_ => {
        setIsRevoking(false);

        // "Refresh" keys to remove the newly revoked key
        paginationProps.request();

        revokeKeysDialog.close();
      })
      .catch(errorResponse => {
        setIsRevoking(false);

        const errors = getAPIErrorOrDefault(
          errorResponse,
          'There was an issue revoking your Object Storage Key.'
        );
        setRevokeErrors(errors);
      });
  };

  return (
    <React.Fragment>
      <Grid container justify="space-between" alignItems="flex-end">
        <Grid item>
          <Typography
            role="header"
            variant="h2"
            className={classes.headline}
            data-qa-table="Object Storage Keys"
          >
            Object Storage Keys
          </Typography>
        </Grid>
        <Grid item>
          <AddNewLink
            onClick={createDrawer.open}
            label="Create an Object Storage Key"
          />
        </Grid>
      </Grid>

      <ObjectStorageKeyTable
        {...paginationProps}
        openRevokeDialog={(objectStorageKey: Linode.ObjectStorageKey) => {
          setKeyToRevoke(objectStorageKey);
          revokeKeysDialog.open();
        }}
      />

      <PaginationFooter
        page={props.page}
        pageSize={props.pageSize}
        count={props.count}
        handlePageChange={props.handlePageChange}
        handleSizeChange={props.handlePageSizeChange}
        eventCategory="object storage keys table"
      />

      <ObjectStorageDrawer
        open={createDrawer.isOpen}
        onClose={createDrawer.close}
        onSubmit={handleSubmit}
      />

      <ObjectStorageKeyDisplayDialog
        objectStorageKey={keyToDisplay}
        isOpen={displayKeysDialog.isOpen}
        close={displayKeysDialog.close}
      />
      <ObjectStorageRevokeKeysDialog
        isOpen={revokeKeysDialog.isOpen}
        label={(keyToRevoke && keyToRevoke.label) || ''}
        handleClose={() => {
          setRevokeErrors([]);
          revokeKeysDialog.close();
        }}
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

const enhanced = compose(
  styled,
  paginated
);

export default enhanced(ObjectStorageKeys);
