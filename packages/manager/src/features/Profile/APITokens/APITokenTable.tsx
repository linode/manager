import { Account } from '@linode/api-v4/lib';
import {
  createPersonalAccessToken,
  deleteAppToken,
  deletePersonalAccessToken,
  getAppTokens,
  getPersonalAccessTokens,
  Token,
  updatePersonalAccessToken,
} from '@linode/api-v4/lib/profile';
import { APIError } from '@linode/api-v4/lib/types';
import { DateTime } from 'luxon';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Grid from 'src/components/Grid';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import TableSortCell from 'src/components/TableSortCell';
import SecretTokenDialog from 'src/features/Profile/SecretTokenDialog';
import { queryClient } from 'src/queries/base';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import isPast from 'src/utilities/isPast';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import APITokenDrawer, { DrawerMode, genExpiryTups } from './APITokenDrawer';
import APITokenMenu from './APITokenMenu';
import { basePermNameMap, basePerms } from './utils';

type ClassNames =
  | 'root'
  | 'headline'
  | 'tokens'
  | 'addNewWrapper'
  | 'labelCell';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      background: theme.color.white,
      width: '100%',
    },
    headline: {
      marginLeft: 7,
    },
    tokens: {
      marginBottom: theme.spacing(2),
    },
    addNewWrapper: {
      '&.MuiGrid-item': {
        padding: 5,
      },
    },
    labelCell: {
      ...theme.applyTableHeaderStyles,
      width: '40%',
      [theme.breakpoints.down('md')]: {
        width: '25%',
      },
    },
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
  submittingDialog: boolean;
}

interface TokenState {
  open: boolean;
  value?: string;
}

interface State {
  form: FormState;
  dialog: DialogState;
  token?: TokenState;
  submitting: boolean;
}

type CombinedProps = Props & PaginationProps<Token> & WithStyles<ClassNames>;

export class APITokenTable extends React.Component<CombinedProps, State> {
  static defaultState: State = {
    form: {
      mode: 'view' as DrawerMode,
      open: false,
      errors: undefined,
      id: undefined,
      values: {
        scopes: '*',
        expiry: genExpiryTups()[3][1],
        label: '',
      },
    },
    dialog: {
      open: false,
      id: 0,
      label: undefined,
      errors: undefined,
      type: '',
      submittingDialog: false,
    },
    token: {
      open: false,
      value: undefined,
    },
    submitting: false,
  };

  mounted: boolean = false;

  state = {
    ...APITokenTable.defaultState,
  };

  openCreateDrawer = () => {
    this.setState({
      form: {
        ...APITokenTable.defaultState.form,
        mode: 'create',
        open: true,
        id: undefined,
        values: {
          label: '',
          expiry: genExpiryTups()[0][1],
          scopes: '*',
        },
      },
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
          expiry: token.expiry ?? '',
          label: token.label,
        },
      },
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
          expiry: token.expiry ?? '',
          label: token.label,
        },
      },
    });
  };

  closeDrawer = () => {
    const { form } = this.state;
    /* Only set { open: false } to avoid flicker of drawer appearance while closing */
    this.setState({
      form: {
        ...form,
        open: false,
      },
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
        errors: undefined,
      },
    });
  };

  closeRevokeDialog = () => {
    this.setState({
      dialog: {
        ...this.state.dialog,
        id: undefined,
        open: false,
        submittingDialog: false,
      },
    });
  };

  openTokenDialog = (token: string) => {
    this.setState({
      dialog: {
        ...this.state.dialog,
        errors: undefined,
      },
      form: {
        ...this.state.form,
        errors: undefined,
      },
      token: {
        open: true,
        value: token,
      },
    });
  };

  closeTokenDialog = () => {
    this.setState({ token: { open: false, value: undefined } });
  };

  revokePersonalAccessToken = () => {
    const { dialog } = this.state;
    this.setState({
      ...this.state,
      dialog: { ...dialog, submittingDialog: true },
    });
    deletePersonalAccessToken(dialog.id as number)
      .then(() => this.props.onDelete())
      .then(() =>
        this.setState({
          ...this.state,
          dialog: { ...dialog, submittingDialog: false },
        })
      )
      .then(() => this.closeRevokeDialog())
      .catch((err: any) => {
        this.setState(
          {
            ...this.state,
            dialog: { ...dialog, submittingDialog: false },
          },
          () => this.showDialogError(err)
        );
      });
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
        errors: apiError,
      },
    });
  }

  handleDrawerChange = (key: string, value: string) => {
    const { form } = this.state;
    this.setState({
      form: { ...form, values: { ...form.values, [key]: value } },
    });
  };

  createToken = (scopes: string) => {
    if (scopes === '') {
      this.setState(
        {
          form: {
            ...this.state.form,
            errors: [
              { reason: 'You must select some permissions', field: 'scopes' },
            ],
          },
        },
        () => {
          scrollErrorIntoView();
        }
      );
      return;
    }

    const { form } = this.state;
    this.setState(
      {
        submitting: true,
        form: { ...form, values: { ...form.values, scopes } },
      },
      () => {
        createPersonalAccessToken(this.state.form.values)
          .then(({ token }) => {
            if (!token) {
              return this.setState(
                {
                  submitting: false,
                  form: {
                    ...form,
                    errors: [
                      { field: 'none', reason: 'API did not return a token.' },
                    ],
                  },
                },
                () => {
                  scrollErrorIntoView();
                }
              );
            }
            this.setState({ submitting: false });
            this.closeDrawer();
            this.openTokenDialog(token);
          })
          .then(() => this.props.request())
          .catch((errResponse) => {
            if (!this.mounted) {
              return;
            }

            this.setState(
              {
                submitting: false,
                form: {
                  ...form,
                  errors: getAPIErrorOrDefault(errResponse),
                },
              },
              () => {
                scrollErrorIntoView();
              }
            );
          });
      }
    );
  };

  editToken = () => {
    const {
      form: {
        id,
        values: { label },
      },
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
              { reason: 'You must give your token a label.', field: 'label' },
            ],
          },
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
      .catch((errResponse) => {
        if (!this.mounted) {
          return;
        }

        this.setState(
          {
            form: {
              ...this.state.form,
              errors: getAPIErrorOrDefault(errResponse),
            },
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
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
      return <TableRowLoading columns={6} />;
    }

    if (error) {
      return <TableRowError colSpan={6} message={error[0].reason} />;
    }

    const tokens = data ?? [];

    return tokens.length > 0 ? (
      this.renderRows(tokens)
    ) : (
      <TableRowEmptyState colSpan={6} />
    );
  }

  renderRows(tokens: Token[]) {
    const { title, type } = this.props;

    return tokens.map((token: Token) => (
      <TableRow
        ariaLabel={token.label}
        key={token.id}
        data-qa-table-row={token.label}
      >
        <TableCell>
          <Typography variant="h3" data-qa-token-label>
            {token.label}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" data-qa-token-created>
            <DateTimeDisplay value={token.created} />
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body1" data-qa-token-expiry>
            {
              /*
             The expiry time of tokens that never expire are returned from the API as
             200 years in the future, so we just need to check that they're at least
             100 years into the future to safely assume they never expire.

             The expiry time of apps that don't expire until revoked come back as 'null'.
             In this case, we display an expiry time of "never" as well.
             */
              token.expiry === null || isWayInTheFuture(token.expiry) ? (
                'never'
              ) : (
                <DateTimeDisplay value={token.expiry} />
              )
            }
          </Typography>
        </TableCell>
        <TableCell actionCell>
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
    const { classes, type, title } = this.props;
    const { form, dialog, submitting } = this.state;
    const account = queryClient.getQueryData<Account>('account');

    const basePermsWithLKE = [...basePerms];
    basePermsWithLKE.splice(5, 0, 'lke');

    return (
      <React.Fragment>
        <Grid
          className={`${classes.root} m0`}
          container
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid item>
            <Typography
              variant="h3"
              className={classes.headline}
              data-qa-table={type}
            >
              {title}
            </Typography>
          </Grid>
          <Grid item className={classes.addNewWrapper}>
            {type === 'Personal Access Token' && (
              <AddNewLink
                onClick={this.openCreateDrawer}
                label="Create a Personal Access Token"
              />
            )}
          </Grid>
        </Grid>
        <div className={classes.tokens}>
          <Table aria-label="List of Personal Access Tokens">
            <TableHead>
              <TableRow data-qa-table-head>
                <TableSortCell
                  className={classes.labelCell}
                  active={this.props.orderBy === 'label'}
                  label="label"
                  direction={this.props.order}
                  handleClick={this.props.handleOrderChange}
                >
                  Label
                </TableSortCell>
                <TableSortCell
                  active={this.props.orderBy === 'created'}
                  label="created"
                  direction={this.props.order}
                  handleClick={this.props.handleOrderChange}
                >
                  Created
                </TableSortCell>
                <TableSortCell
                  active={this.props.orderBy === 'expiry'}
                  label="expiry"
                  direction={this.props.order}
                  handleClick={this.props.handleOrderChange}
                >
                  Expires
                </TableSortCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>{this.renderContent()}</TableBody>
          </Table>
        </div>
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
          submitting={submitting}
          errors={form.errors}
          id={form.id}
          label={form.values.label}
          scopes={form.values.scopes}
          expiry={form.values.expiry}
          perms={
            !account?.capabilities.includes('Kubernetes')
              ? basePerms
              : basePermsWithLKE
          }
          permNameMap={
            !account?.capabilities.includes('Kubernetes')
              ? basePermNameMap
              : {
                  ...basePermNameMap,
                  lke: 'Kubernetes',
                }
          }
          closeDrawer={this.closeDrawer}
          onChange={this.handleDrawerChange}
          onCreate={this.createToken}
          onEdit={this.editToken}
        />

        <ConfirmationDialog
          title={`Revoking ${dialog.label}`}
          open={dialog.open}
          error={(this.state.dialog.errors || [])
            .map((e) => e.reason)
            .join(',')}
          actions={this.renderRevokeConfirmationActions}
          onClose={this.closeRevokeDialog}
        >
          <Typography>
            Are you sure you want to revoke this API Token?
          </Typography>
        </ConfirmationDialog>

        <SecretTokenDialog
          title="Personal Access Token"
          open={Boolean(this.state.token && this.state.token.open)}
          onClose={this.closeTokenDialog}
          value={this.state.token?.value}
        />
      </React.Fragment>
    );
  }
  revokeAction = () => {
    const {
      dialog: { type },
    } = this.state;

    return type === 'OAuth Client Token'
      ? this.revokeAppToken()
      : this.revokePersonalAccessToken();
  };

  renderRevokeConfirmationActions = () => {
    return (
      <ActionsPanel>
        <Button
          buttonType="secondary"
          onClick={this.closeRevokeDialog}
          data-qa-button-cancel
        >
          Cancel
        </Button>
        <Button
          buttonType="primary"
          onClick={this.revokeAction}
          loading={this.state.dialog.submittingDialog}
          data-qa-button-confirm
        >
          Revoke
        </Button>
      </ActionsPanel>
    );
  };
}

/**
 * return true if the given time is past 100 year in the future
 */
export const isWayInTheFuture = (time: string) => {
  const wayInTheFuture = DateTime.local().plus({ years: 100 }).toISO();
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

const enhanced = compose<CombinedProps, Props>(paginated, styled);

export default enhanced(APITokenTable);
