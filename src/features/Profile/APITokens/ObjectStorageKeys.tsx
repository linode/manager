import * as React from 'react';
import { compose } from 'recompose';
import AddNewLink from 'src/components/AddNewLink';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Button from 'src/components/core/Button';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import { useForm } from 'src/hooks/useForm';
import {
  CreateObjectStorageKeyRequest,
  createObjectStorageKeys,
  getObjectStorageKeys
} from 'src/services/profile/objectStorageKeys';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import ObjectStorageDrawer from './ObjectStorageDrawer';
import ObjectStorageKeyTable from './ObjectStorageKeyTable';

type ClassNames =
  | 'headline'
  | 'paper'
  | 'helperText'
  | 'labelCell'
  | 'createdCell'
  | 'confirmationDialog';

const styles: StyleRulesCallback<ClassNames> = theme => {
  return {
    headline: {
      marginTop: theme.spacing.unit * 2,
      marginBottom: theme.spacing.unit * 2
    },
    paper: {
      marginBottom: theme.spacing.unit * 2
    },
    labelCell: {
      width: '40%'
    },
    createdCell: {
      width: '30%'
    },
    helperText: {
      marginBottom: theme.spacing.unit * 3
    },
    confirmationDialog: {
      paddingBottom: 0,
      marginBottom: 0
    }
  };
};

interface KeysState {
  dialogOpen: boolean;
  accessKey?: string;
  secretKey?: string;
}

interface DrawerState {
  open: boolean;
  errors?: Linode.ApiFieldError[];
}

type Props = PaginationProps<Linode.ObjectStorageKey> & WithStyles<ClassNames>;

export const ObjectStorageKeys: React.StatelessComponent<Props> = props => {
  const { classes, ...paginationProps } = props;

  const [keys, setKeys] = React.useState<KeysState>({ dialogOpen: false });
  const [form, setField, resetForm] = useForm<CreateObjectStorageKeyRequest>({
    label: ''
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [drawer, setDrawer] = React.useState<DrawerState>({ open: false });

  const closeDialog = () => setKeys({ ...keys, dialogOpen: false });
  const openDrawer = () => setDrawer({ open: true, errors: [] });
  const closeDrawer = () => setDrawer({ open: false, errors: [] });

  const handleSubmit = () => {
    setIsLoading(true);
    createObjectStorageKeys(form)
      .then(data => {
        setIsLoading(false);
        resetForm();

        const accessKey = data.access_key;
        const secretKey = data.secret_key;

        setKeys({ accessKey, secretKey, dialogOpen: true });
        closeDrawer();
        paginationProps.request();
      })
      .catch(err => {
        setIsLoading(false);

        const errors = getAPIErrorOrDefault(
          err,
          'Error generating Object Storage Key.'
        );
        setDrawer({ ...drawer, errors });
      });
  };

  // Request keys on first render
  React.useEffect(() => {
    paginationProps.request();
  }, []);

  const confirmationDialogActions = (
    <Button type="secondary" onClick={closeDialog} data-qa-close-dialog>
      OK
    </Button>
  );

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
            onClick={openDrawer}
            label="Create an Object Storage Key"
          />
        </Grid>
      </Grid>

      <ObjectStorageKeyTable {...paginationProps} />

      <PaginationFooter
        page={props.page}
        pageSize={props.pageSize}
        count={props.count}
        handlePageChange={props.handlePageChange}
        handleSizeChange={props.handlePageSizeChange}
        eventCategory="object storage keys table"
      />

      <ObjectStorageDrawer
        open={drawer.open}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
        label={form.label}
        updateLabel={(e: React.ChangeEvent<HTMLInputElement>) =>
          setField('label', e.target.value)
        }
        isLoading={isLoading}
        errors={drawer.errors}
      />

      <ConfirmationDialog
        title="Object Storage Keys"
        actions={confirmationDialogActions}
        open={keys.dialogOpen}
        onClose={closeDrawer}
        className={classes.confirmationDialog}
      >
        <Typography variant="body1" className={classes.helperText}>
          Your Object Storage keys have been created. Store these credentials.
          They won't be shown again.
        </Typography>

        <Typography>
          <b>Access Key:</b>
        </Typography>
        <Notice
          spacingTop={16}
          typeProps={{ variant: 'body1' }}
          warning
          text={keys.accessKey}
          breakWords
        />

        <Typography>
          <b>Secret Key:</b>
        </Typography>
        <Notice
          spacingTop={16}
          typeProps={{ variant: 'body1' }}
          warning
          text={keys.secretKey}
          breakWords
        />
      </ConfirmationDialog>
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
