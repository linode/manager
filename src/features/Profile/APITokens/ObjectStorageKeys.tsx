import { pathOr } from 'ramda';
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
import { createObjectStorageKeys } from 'src/services/profile/objectStorageKeys';
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
  const [drawer, setDrawer] = React.useState<DrawerState>({ open: false });

  const handleSubmit = () => {
    createObjectStorageKeys()
      .then(data => {
        // Keys are returned from the API in an array – for now, just use the first pair.
        if (data.keys && data.keys.length > 0) {
          const accessKey = data.keys[0].access_key;
          const secretKey = data.keys[0].secret_key;

          setKeys({ accessKey, secretKey, dialogOpen: true });
          setDrawer({ open: false });
        }
      })
      .catch(err => {
        const defaultError: Linode.ApiFieldError[] = [
          {
            field: 'none',
            reason: 'Could not generate Object Storage Keys at this time.'
          }
        ];
        const errors: Linode.ApiFieldError[] = pathOr(
          defaultError,
          ['response', 'data', 'errors'],
          err
        );
        setDrawer({ ...drawer, errors });
      });
  };

  const confirmationDialogActions = (
    <Button
      type="secondary"
      onClick={() => setKeys({ ...keys, dialogOpen: false })}
      data-qa-close-dialog
    >
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
            onClick={() => setDrawer({ open: true })}
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
        onClose={() => setDrawer({ open: false })}
        onSubmit={handleSubmit}
        errors={drawer.errors}
      />

      <ConfirmationDialog
        title="Object Storage Keys"
        actions={confirmationDialogActions}
        open={keys.dialogOpen}
        onClose={() => setKeys({ ...keys, dialogOpen: false })}
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
