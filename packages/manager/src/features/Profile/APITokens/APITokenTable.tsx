import {
  createPersonalAccessToken,
  deleteAppToken,
  deletePersonalAccessToken,
  getAppTokens,
  getPersonalAccessTokens,
  Token,
  updatePersonalAccessToken
} from 'linode-js-sdk/lib/profile';
import { APIError } from 'linode-js-sdk/lib/types';
import * as moment from 'moment';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import withFeatureFlagConsumer, {
  FeatureFlagConsumerProps
} from 'src/containers/withFeatureFlagConsumer.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import isPast from 'src/utilities/isPast';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import APITokenDrawer, { DrawerMode, genExpiryTups } from './APITokenDrawer';
import APITokenMenu from './APITokenMenu';
import { basePermNameMap, basePerms } from './utils';

type ClassNames = 'headline' | 'paper' | 'labelCell' | 'createdCell';

const styles = (theme: Theme) =>
  createStyles({
    headline: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    },
    paper: {
      marginBottom: theme.spacing(2)
    },
    labelCell: {
      width: '40%'
    },
    createdCell: {
      width: '30%'
    }
  });

export type APITokenType = 'OAuth Client Token' | 'Personal Access Token';
export type APITokenTitle =
  | 'Third Party Access Tokens'
  | 'Personal Access Tokens';

interface Props {
  type: APITokenType;
  title: APITokenTitle;
}

interface FormState {
  mode: DrawerMode;
  open: boolean;
  errors?: APIError[];
  id?: number;
  values: {
    scopes?: string;
    expiry?: string;
    label: string;
  };
}

interface DialogState {
  open: boolean;
  id?: number;
  label?: string;
  errors?: APIError[];
  type: string;
}

interface TokenState {
  open: boolean;
  value?: string;
}

interface State {
  form: FormState;
  dialog: DialogState;
  token?: TokenState;
}

type CombinedProps = Props &
  PaginationProps<Token> &
  WithStyles<ClassNames> &
  FeatureFlagConsumerProps;

export const filterOutLinodeApps = (token: Token) =>
  !token.website || !/.linode.com$/.test(token.website);

export class APITokenTable extends React.Component<CombinedProps, State> {
  static defaultState: State = {
    form: {
      mode: 'view' as DrawerMode,
      open: false,
      errors: undefined,
      id: undefined,
      values: {
        scopes: undefined,
        expiry: genExpiryTups()[0][1],
        label: ''
      }
    },
    dialog: {
      open: false,
      id: 0,
      label: undefined,
      errors: undefined,
      type: ''
    },
    token: {
      open: false,
      value: undefined
    }
  };

  mounted: boolean = false;

  state = {
    ...APITokenTable.defaultState
  };

  openCreateDrawer = () => {
    this.setState({
      form: {
        ...APITokenTable.defaultState.form,
        mode: 'create',
        open: true
      }
    });
  };

  openViewDrawer = (token: Token) => {
    this.setState({
      form: {
        ...APITokenTable.defaultState.form,
        mode: 'view',
        open: true,
        id: token.id,
        values: {
          scopes: token.scopes,
          expiry: token.expiry,
          label: token.label
        }
      }
    });
  };

  openEditDrawer = (token: Token) => {
    this.setState({
      form: {
        ...APITokenTable.defaultState.form,
        mode: 'edit',
        open: true,
        id: token.id,
        values: {
          scopes: token.scopes,
          expiry: token.expiry,
          label: token.label
        }
      }
    });
  };

  closeDrawer = () => {
    const { form } = this.state;
    /* Only set { open: false } to avoid flicker of drawer appearance while closing */
    this.setState({
      form: {
        ...form,
        open: false
      }
    });
  };

  openRevokeDialog = (token: Token, type: string) => {
    const { label, id } = token;
    this.setState({
      dialog: {
        ...this.state.dialog,
        open: true,
        label,
        id,
        type,
        errors: undefined
      }
    });
  };

  closeRevokeDialog = () => {
    this.setState({
      dialog: { ...this.state.dialog, id: undefined, open: false }
    });
  };

  openTokenDialog = (token: string) => {
    this.setState({
      dialog: {
        ...this.state.dialog,
        errors: undefined
      },
      form: {
        ...this.state.form,
        errors: undefined
      },
      token: {
        open: true,
        value: token
      }
    });
  };

  closeTokenDialog = () => {
    this.setState({ token: { open: false, value: undefined } });
  };

  revokePersonalAccessToken = () => {
    const { dialog } = this.state;
    deletePersonalAccessToken(dialog.id as number)
      .then(() => this.props.onDelete())
      .then(() => this.closeRevokeDialog())
      .catch((err: any) => this.showDialogError(err));
  };

  revokeAppToken = () => {
    const { dialog } = this.state;
    deleteAppToken(dialog.id as number)
      .then(() => this.props.onDelete())
      .then(() => {
        this.closeRevokeDialog();
      })
      .catch((err: any) => this.showDialogError(err));
  };

  showDialogError(err: any) {
    const apiError = getAPIErrorOrDefault(
      err,
      'Unable to complete your request at this time.'
    );

    return this.setState({
      dialog: {
        ...this.state.dialog,
        open: true,
        errors: apiError
      }
    });
  }

  handleDrawerChange = (key: string, value: string) => {
    const { form } = this.state;
    this.setState({
      form: { ...form, values: { ...form.values, [key]: value } }
    });
  };

  createToken = (scopes: string) => {
    if (scopes === '') {
      this.setState(
        {
          form: {
            ...this.state.form,
            errors: [
              { reason: 'You must select some permissions', field: 'scopes' }
            ]
          }
        },
        () => {
          scrollErrorIntoView();
        }
      );
      return;
    }
    if (!this.state.form.values.label) {
      // if no label
      this.setState(
        {
          form: {
            ...this.state.form,
            errors: [
              { reason: 'You must give your token a label.', field: 'label' }
            ]
          }
        },
        () => {
          scrollErrorIntoView();
        }
      );
      return;
    }

    const { form } = this.state;
    this.setState(
      { form: { ...form, values: { ...form.values, scopes } } },
      () => {
        createPersonalAccessToken(this.state.form.values)
          .then(({ token }) => {
            if (!token) {
              return this.setState(
                {
                  form: {
                    ...form,
                    errors: [
                      { field: 'none', reason: 'API did not return a token.' }
                    ]
                  }
                },
                () => {
                  scrollErrorIntoView();
                }
              );
            }
            this.closeDrawer();
            this.openTokenDialog(token);
          })
          .then(() => this.props.request())
          .catch(errResponse => {
            if (!this.mounted) {
              return;
            }

            this.setState(
              {
                form: {
                  ...form,
                  errors: getAPIErrorOrDefault(errResponse)
                }
              },
              () => {
                scrollErrorIntoView();
              }
            );
          });
      }
    );
    return;
  };

  editToken = () => {
    const {
      form: {
        id,
        values: { label }
      }
    } = this.state;
    if (!id) {
      return;
    }

    if (!label) {
      this.setState(
        {
          form: {
            ...this.state.form,
            errors: [
              { reason: 'You must give your token a label.', field: 'label' }
            ]
          }
        },
        () => {
          scrollErrorIntoView();
        }
      );
      return;
    }

    updatePersonalAccessToken(id, { label })
      .then(() => {
        this.closeDrawer();
      })
      .then(() => this.props.request())
      .catch(errResponse => {
        if (!this.mounted) {
          return;
        }

        this.setState(
          {
            form: {
              ...this.state.form,
              errors: getAPIErrorOrDefault(errResponse)
            }
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
    return;
  };

  componentDidMount() {
    this.mounted = true;
    this.props.handleOrderChange('created');
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  renderContent() {
    const { error, loading, data } = this.props;

    if (loading) {
      return <TableRowLoading colSpan={6} />;
    }

    if (error) {
      return <TableRowError colSpan={6} message={error[0].reason} />;
    }

    const filteredData = data ? data.filter(filterOutLinodeApps) : [];

    return filteredData.length > 0 ? (
      this.renderRows(filteredData)
    ) : (
      <TableRowEmptyState colSpan={6} />
    );
  }

  renderRows(tokens: Token[]) {
    const { title, type } = this.props;

    return tokens.map((token: Token) => (
      <TableRow key={token.id} data-qa-table-row={token.label}>
        <TableCell parentColumn="Label">
          <Typography variant="h3" data-qa-token-label>
            {token.label}
          </Typography>
        </TableCell>
        <TableCell parentColumn="Created">
          <Typography variant="body1" data-qa-token-created>
            <DateTimeDisplay value={token.created} humanizeCutoff="month" />
          </Typography>
        </TableCell>
        <TableCell parentColumn="Expires">
          <Typography variant="body1" data-qa-token-expiry>
            {/*
             The expiry time of tokens that never expire are returned from the API as
             200 years in the future, so we just need to check that they're at least
             100 years into the future to safely assume they never expire.

             The expiry time of apps that don't expire until revoked come back as 'null'.
             In this case, we display an expiry time of "never" as well.
             */
            isWayInTheFuture(token.expiry) || token.expiry === null ? (
              'never'
            ) : (
              <DateTimeDisplay value={token.expiry} humanizeCutoff="month" />
            )}
          </Typography>
        </TableCell>
        <TableCell>
          <APITokenMenu
            token={token}
            type={type}
            isThirdPartyAccessToken={title === 'Third Party Access Tokens'}
            openViewDrawer={this.openViewDrawer}
            openEditDrawer={this.openEditDrawer}
            openRevokeDialog={this.openRevokeDialog}
          />
        </TableCell>
      </TableRow>
    ));
  }

  render() {
    const { classes, flags, type, title } = this.props;
    const { form, dialog } = this.state;

    // If Object Storage is enabled, add it to the list of perms.
    // @todo: Once Object Storage is safely in GA, remove this logic.
    const perms = flags.objectStorage
      ? //  Scopes are returned from the API sorted alphabetically. Since we're
        // manually inserting a scope here, I chose to sort the entire list
        // instead of inserting 'object_storage' in the correct place according
        // to the hard-coded basePerms array (that seemed brittle).
        [...basePerms, 'object_storage'].sort()
      : basePerms;

    const permNameMap = flags.objectStorage
      ? { ...basePermNameMap, object_storage: 'Object Storage' }
      : basePermNameMap;

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end">
          <Grid item>
            <Typography
              variant="h2"
              className={classes.headline}
              data-qa-table={type}
            >
              {title}
            </Typography>
          </Grid>
          <Grid item>
            {type === 'Personal Access Token' && (
              <AddNewLink
                onClick={this.openCreateDrawer}
                label="Add a Personal Access Token"
              />
            )}
          </Grid>
        </Grid>
        <Paper className={classes.paper}>
          <Table aria-label="List of Personal Access Tokens">
            <TableHead>
              <TableRow data-qa-table-head>
                <TableCell className={classes.labelCell}>Label</TableCell>
                <TableCell className={classes.createdCell}>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>{this.renderContent()}</TableBody>
          </Table>
        </Paper>
        <PaginationFooter
          page={this.props.page}
          pageSize={this.props.pageSize}
          count={this.props.count}
          handlePageChange={this.props.handlePageChange}
          handleSizeChange={this.props.handlePageSizeChange}
          eventCategory="api tokens table"
        />

        <APITokenDrawer
          open={form.open}
          mode={form.mode}
          errors={form.errors}
          id={form.id}
          label={form.values.label}
          scopes={form.values.scopes}
          expiry={form.values.expiry}
          perms={perms}
          permNameMap={permNameMap}
          closeDrawer={this.closeDrawer}
          onChange={this.handleDrawerChange}
          onCreate={this.createToken}
          onEdit={this.editToken}
        />

        <ConfirmationDialog
          title={`Revoking ${dialog.label}`}
          open={dialog.open}
          error={(this.state.dialog.errors || []).map(e => e.reason).join(',')}
          actions={this.renderRevokeConfirmationActions}
          onClose={this.closeRevokeDialog}
        >
          <Typography>
            Are you sure you want to revoke this API Token?
          </Typography>
        </ConfirmationDialog>

        <ConfirmationDialog
          title="Personal Access Token"
          error={(this.state.dialog.errors || []).map(e => e.reason).join(',')}
          actions={this.renderPersonalAccessTokenDisplayActions}
          open={Boolean(this.state.token && this.state.token.open)}
          onClose={this.closeTokenDialog}
          maxWidth="md"
        >
          <Typography variant="body1">
            {`Your personal access token has been created.
              Store this secret. It won't be shown again.`}
          </Typography>
          <Notice
            spacingTop={16}
            typeProps={{ variant: 'body1' }}
            warning
            text={this.state.token && this.state.token.value!}
            breakWords
          />
        </ConfirmationDialog>
      </React.Fragment>
    );
  }
  revokeAction = () => {
    const {
      dialog: { type }
    } = this.state;

    type === 'OAuth Client Token'
      ? this.revokeAppToken()
      : this.revokePersonalAccessToken();
  };

  renderRevokeConfirmationActions = () => {
    return (
      <React.Fragment>
        <ActionsPanel>
          <Button
            buttonType="cancel"
            onClick={this.closeRevokeDialog}
            data-qa-button-cancel
          >
            Cancel
          </Button>
          <Button
            buttonType="secondary"
            destructive
            onClick={this.revokeAction}
            data-qa-button-confirm
          >
            Revoke
          </Button>
        </ActionsPanel>
      </React.Fragment>
    );
  };

  renderPersonalAccessTokenDisplayActions = () => (
    <Button
      buttonType="secondary"
      onClick={this.closeTokenDialog}
      data-qa-close-dialog
    >
      OK
    </Button>
  );
}

/**
 * return true if the given time is past 100 year in the future
 */
export const isWayInTheFuture = (time: string) => {
  const wayInTheFuture = moment
    .utc()
    .add(100, 'years')
    .format();
  return isPast(wayInTheFuture)(time);
};

const styled = withStyles(styles);

const updatedRequest = (ownProps: Props, params: any, filters: any) => {
  if (ownProps.type === 'OAuth Client Token') {
    return getAppTokens(params, filters);
  } else {
    return getPersonalAccessTokens(params, filters);
  }
};

const paginated = Pagey(updatedRequest);

const enhanced = compose<CombinedProps, Props>(
  paginated,
  styled,
  withFeatureFlagConsumer
);

export default enhanced(APITokenTable);
