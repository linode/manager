import * as React from 'react';
import { compose } from 'recompose';
import AddNewLink from 'src/components/AddNewLink';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Button from 'src/components/core/Button';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import { useForm } from 'src/hooks/useForm';
import {
  createObjectStorageKeys,
  CreateObjectStorageKeysRequest
} from 'src/services/profile/objectStorageKeys';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import ObjectStorageDrawer from './ObjectStorageDrawer';

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

type Props = WithStyles<ClassNames>;

export const ObjectStorageKeys: React.StatelessComponent<Props> = props => {
  const { classes } = props;

  const [keys, setKeys] = React.useState<KeysState>({ dialogOpen: false });
  const [form, setField] = useForm<CreateObjectStorageKeysRequest>({
    label: ''
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [drawer, setDrawer] = React.useState<DrawerState>({ open: false });

  const closeDialog = () => setKeys({ ...keys, dialogOpen: false });
  const openDrawer = () => setDrawer({ ...drawer, open: true });
  const closeDrawer = () => setDrawer({ ...drawer, open: false });

  const handleSubmit = () => {
    setIsLoading(true);
    createObjectStorageKeys(form)
      .then(data => {
        // Keys are returned from the API in an array – for now, just use the first pair.
        if (data.keys && data.keys.length > 0) {
          setIsLoading(false);

          const accessKey = data.keys[0].access_key;
          const secretKey = data.keys[0].secret_key;

          setKeys({ accessKey, secretKey, dialogOpen: true });
          closeDrawer();
        }
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
      <Paper className={classes.paper}>
        <Table aria-label="List of Object Storage Keys">
          <TableHead>
            <TableRow data-qa-table-head>
              <TableCell className={classes.labelCell}>Label</TableCell>
              <TableCell className={classes.labelCell}>Access Key</TableCell>
              <TableCell className={classes.createdCell}>Created</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {/* @todo: List Object Storage Access Keys when returned by API */}
            <TableRowEmptyState colSpan={6} />
          </TableBody>
        </Table>
      </Paper>

      <ObjectStorageDrawer
        open={drawer.open}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
        label={form.label}
        updateLabel={e => setField('label', e.target.value)}
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

const enhanced = compose(styled);

export default enhanced(ObjectStorageKeys);
