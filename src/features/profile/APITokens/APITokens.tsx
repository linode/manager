import * as React from 'react';
import * as moment from 'moment';
import { compose, filter, path, pathOr, sort } from 'ramda';

import { withStyles, Theme, WithStyles, StyleRulesCallback } from 'material-ui/styles';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import TableBody from 'material-ui/Table/TableBody';
import TableCell from 'material-ui/Table/TableCell';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';

import {
  createPersonalAccessToken,
  getAppTokens,
  deletePersonalAccessToken,
  getPersonalAccessTokens,
  deleteAppToken,
  updatePersonalAccessToken,
}
  from 'src/services/profile';
import isPast from 'src/utilities/isPast';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import Table from 'src/components/Table';
import Grid from 'src/components/Grid';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Notice from 'src/components/Notice';

import APITokenMenu from './APITokenMenu';
import APITokenDrawer, { DrawerMode, genExpiryTups } from './APITokenDrawer';
import AddNewLink from 'src/components/AddNewLink';

type ClassNames = 'headline'
  | 'paper'
  | 'labelCell'
  | 'typeCell'
  | 'createdCell';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => {
  return ({
    headline: {
      marginTop: theme.spacing.unit * 2,
      marginBottom: theme.spacing.unit * 2,
    },
    paper: {
      marginBottom: theme.spacing.unit * 2,
    },
    labelCell: {
      width: '30%',
    },
    typeCell: {
      width: '20%',
    },
    createdCell: {
      width: '20%',
    },
  });
};

const preloaded = PromiseLoader<Props>({
  pats: () => getPersonalAccessTokens()
    .then((response) => {
      return response.data;
    }),
  appTokens: () => getAppTokens()
    .then(response => response.data),
});

interface Props {
  pats: PromiseLoaderResponse<Linode.Token[]>;
  appTokens: PromiseLoaderResponse<Linode.Token[]>;
}

interface FormState {
  mode: DrawerMode;
  open: boolean;
  errors?: Linode.ApiFieldError[];
  id?: number;
  values: {
    scopes?: string;
    expiry?: string;
    label?: string;
  };
}

interface DialogState {
  open: boolean;
  id?: number;
  label?: string;
}

interface TokenState {
  open: boolean;
  value?: string;
}

interface State {
  pats: Linode.Token[];
  form: FormState;
  dialog: DialogState;
  token?: TokenState;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class APITokens extends React.Component<CombinedProps, State> {
  static defaultState = {
    form: {
      mode: 'view' as DrawerMode,
      open: false,
      errors: undefined,
      id: undefined,
      values: {
        scopes: undefined,
        expiry: genExpiryTups()[0][1],
        label: undefined,
      },
    },
    dialog: {
      open: false,
      id: 0,
      label: undefined,
      type: '',
    },
    token: {
      open: false,
      value: undefined,
    },
  };

  mounted: boolean = false;

  state = {
    pats: pathOr([], ['response'], this.props.pats),
    ...APITokens.defaultState,
  };

  renderTokenTable(
    title: string,
    type: string,
    tokens: Linode.Token[],
  ) {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Grid
          container
          justify="space-between"
          alignItems="flex-end"
        >
          <Grid item>
            <Typography variant="title" className={classes.headline} data-qa-table={title}>
              {title}
            </Typography>
          </Grid>
          <Grid item>
            {type === 'Personal Access Token' &&
              <AddNewLink
                onClick={() => this.openCreateDrawer()}
                label="Add a Personal Access Token"
              />
            }
          </Grid>
        </Grid>
        <Paper className={classes.paper}>
          <Table>
            <TableHead>
              <TableRow data-qa-table-head>
                <TableCell className={classes.labelCell}>Label</TableCell>
                <TableCell className={classes.typeCell}>Type</TableCell>
                <TableCell className={classes.createdCell}>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tokens.map((token: Linode.Token) =>
                <TableRow key={token.id} data-qa-table-row={token.label}>
                  <TableCell>
                    <Typography variant="subheading" data-qa-token-label>
                      {token.label}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" data-qa-token-type>
                      {type}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" data-qa-token-created>
                      {token.created}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" data-qa-token-expiry>
                      {token.expiry}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <APITokenMenu
                      isAppTokenMenu={(title === 'Apps')}
                      openViewDrawer={() => { this.openViewDrawer(token); }}
                      openEditDrawer={() => { this.openEditDrawer(token); }}
                      openRevokeDialog={() => {
                        this.openRevokeDialog(token.label, token.id, type);
                      }}
                    />
                  </TableCell>
                </TableRow>,
              )}
            </TableBody>
          </Table>
        </Paper>
      </React.Fragment>
    );
  }

  formatDates(tokens: Linode.Token[]): Linode.Token[] {
    const aLongTimeFromNow = moment.utc().add(100, 'year');
    return tokens.map((token) => {
      const created = moment.utc(token.created).local();
      const expiry = moment.utc(token.expiry).local();

      return {
        ...token,
        created: created > aLongTimeFromNow ? 'never' : created.fromNow(),
        expiry: expiry > aLongTimeFromNow ? 'never' : expiry.fromNow(),
      };
    });
  }

  requestTokens = () => {
    getPersonalAccessTokens()
      .then(response => response.data)
      .then((data) => {
        if (!this.mounted) { return; }

        return this.setState({ pats: data });
      });
  }

  openCreateDrawer = () => {
    this.setState({
      form: {
        ...APITokens.defaultState.form,
        mode: 'create',
        open: true,

      },
    });
  }

  openViewDrawer = (token: Linode.Token) => {
    this.setState({
      form: {
        ...APITokens.defaultState.form,
        mode: 'view',
        open: true,
        id: token.id,
        values: {
          scopes: token.scopes,
          expiry: token.expiry,
          label: token.label,
        },
      },
    });
  }

  openEditDrawer = (token: Linode.Token) => {
    this.setState({
      form: {
        ...APITokens.defaultState.form,
        mode: 'edit',
        open: true,
        id: token.id,
        values: {
          scopes: token.scopes,
          expiry: token.expiry,
          label: token.label,
        },
      },
    });
  }

  closeDrawer = () => {
    const { form } = this.state;
    /* Only set { open: false } to avoid flicker of drawer appearance while closing */
    this.setState({
      form: {
        ...form,
        open: false,
      },
    });
  }

  openRevokeDialog = (label: string, id: number, type: string) => {
    this.setState({ dialog: { open: true, label, id, type } });
  }

  closeRevokeDialog = () => {
    this.setState({ dialog: { ...this.state.dialog, id: undefined, open: false } });
  }

  openTokenDialog = (token: string) => {
    this.setState({ token: { open: true, value: token } });
  }

  closeTokenDialog = () => {
    this.setState({ token: { open: false, value: undefined } });
  }

  revokePersonalAccessToken = () => {
    const { dialog } = this.state;
    deletePersonalAccessToken(dialog.id)
      .then(() => { this.closeRevokeDialog(); })
      .then(() => this.requestTokens());
  }

  revokeAppToken = () => {
    const { dialog } = this.state;
    deleteAppToken(dialog.id)
      .then(() => { this.closeRevokeDialog(); })
      .then(() => this.requestTokens());
  }

  createToken = (scopes: string) => {
    if (scopes === '') {
      this.setState({
        form: {
          ...this.state.form,
          errors: [
            { reason: 'You must select some permissions', field: 'scopes' },
          ],
        },
      });
      return;
    }
    if (!this.state.form.values.label) { // if no label
      this.setState({
        form: {
          ...this.state.form,
          errors: [
            { reason: 'You must give your token a label.', field: 'label' },
          ],
        },
      });
      return;
    }

    const { form } = this.state;
    this.setState({ form: { ...form, values: { ...form.values, scopes } } }, () => {
      createPersonalAccessToken(this.state.form.values)
        .then(({ token }) => {
          if (!token) {
            return this.setState({
              form: {
                ...form,
                errors: [{ field: 'none', reason: 'API did not return a token.' }],
              },
            });
          }
          this.closeDrawer();
          this.openTokenDialog(token);
        })
        .then(() => this.requestTokens())
        .catch((errResponse) => {
          if (!this.mounted) { return; }

          this.setState({
            form: {
              ...form,
              errors: path(['response', 'data', 'errors'], errResponse),
            },
          });
        });
    });
    return;
  }

  editToken = () => {
    const { form: { id, values: { label } } } = this.state;
    if (!id) { return; }

    if (!label) {
      this.setState({
        form: {
          ...this.state.form,
          errors: [
            { reason: 'You must give your token a label.', field: 'label' },
          ],
        },
      });
      return;
    }

    updatePersonalAccessToken(id, { label })
      .then(() => { this.closeDrawer(); })
      .then(() => this.requestTokens())
      .catch((errResponse) => {
        if (!this.mounted) { return; }

        this.setState({
          form: {
            ...this.state.form,
            errors: path(['response', 'data', 'errors'], errResponse),
          },
        });
      });
    return;
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { form, dialog } = this.state;
    const now = moment.utc().format();
    const isPastNow = isPast(now);

    const appTokens = compose<
      Props,
      Linode.Token[],
      Linode.Token[],
      Linode.Token[],
      Linode.Token[]
      >(
        this.formatDates,
        sortCreatedDateAscending,
        filter<Linode.Token>(t => isPastNow(t.expiry)),
        pathOr([], ['appTokens', 'response']),
    )(this.props);

    const pats = compose<
      State,
      Linode.Token[],
      Linode.Token[],
      Linode.Token[],
      Linode.Token[]
      >(
        this.formatDates,
        sortCreatedDateAscending,
        filter<Linode.Token>(t => isPastNow(t.expiry)),
        pathOr([], ['pats']),
    )(this.state);

    return (
      <React.Fragment>
        {this.renderTokenTable(
          'Personal Access Tokens',
          'Personal Access Token',
          pats,
        )}
        {this.renderTokenTable(
          'Apps',
          'OAuth Client Token',
          appTokens,
        )}
        <APITokenDrawer
          open={form.open}
          mode={form.mode}
          errors={form.errors}
          id={form.id}
          label={form.values.label}
          scopes={form.values.scopes}
          expiry={form.values.expiry}
          closeDrawer={this.closeDrawer}
          onChange={(key, value) => this.setState({
            form:
              { ...form, values: { ...form.values, [key]: value } },
          })}
          onCreate={(scopes: string) => this.createToken(scopes)}
          onEdit={() => this.editToken()}
        />
        <ConfirmationDialog
          title={`Revoking ${dialog.label}`}
          open={dialog.open}
          actions={() => {
            return (
              <React.Fragment>
                <Button
                  variant="raised"
                  color="secondary"
                  className="destructive"
                  onClick={() => {
                    this.closeRevokeDialog();
                    (dialog.type === 'OAuth Client Token')
                      ? this.revokeAppToken()
                      : this.revokePersonalAccessToken();
                  }}
                  data-qa-button-confirm>
                  Yes
                </Button>
                <Button
                  variant="raised"
                  color="secondary"
                  className="cancel"
                  onClick={() => this.closeRevokeDialog()} data-qa-button-cancel
                >
                  No
                </Button>
              </React.Fragment>
            );
          }}
          onClose={() => this.closeRevokeDialog()}
        >
          <Typography>Are you sure you want to revoke this API Token?</Typography>
        </ConfirmationDialog>

        <ConfirmationDialog
          title="Personal Access Token"
          actions={() =>
            <Button
              variant="raised"
              color="primary"
              onClick={() => this.closeTokenDialog()}
              data-qa-close-dialog
            >
              OK
            </Button>}
          open={this.state.token.open}
          onClose={() => this.closeTokenDialog()}
        >
          <Typography variant="body1">
            {`Your personal access token has been created.
              Store this secret. It won't be shown again.`}
          </Typography>
          <Notice typeProps={{ variant: 'caption' }} warning text={this.state.token.value!} />
        </ConfirmationDialog>

      </React.Fragment>
    );
  }
}

const sortCreatedDateAscending = sort((a: Linode.Token, b: Linode.Token) => {
  return moment.utc(b.created).diff(moment.utc(a.created));
});

const styled = withStyles(styles, { withTheme: true })<Props>(APITokens);

export default preloaded(styled);
