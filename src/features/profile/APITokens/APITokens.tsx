import * as React from 'react';
import * as moment from 'moment';
import Axios from 'axios';
import { path, pathOr } from 'ramda';

import { withStyles, Theme, WithStyles, StyleRulesCallback } from 'material-ui/styles';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Table from 'material-ui/Table';
import TableBody from 'material-ui/Table/TableBody';
import TableCell from 'material-ui/Table/TableCell';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';

import { API_ROOT } from 'src/constants';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import IconTextLink from 'src/components/IconTextLink';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

import APITokenMenu from './APITokenMenu';
import APITokenDrawer, { DrawerMode } from './APITokenDrawer';
import PlusSquare from 'src/assets/icons/plus-square.svg';

type ClassNames = 'headline';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => {
  return ({
    headline: {
      marginTop: theme.spacing.unit * 2,
      marginBottom: theme.spacing.unit * 2,
    },
  });
};

const preloaded = PromiseLoader<Props>({
  pats: () => Axios.get(`${API_ROOT}/profile/tokens`)
    .then(response => response.data),
  appTokens: () => Axios.get(`${API_ROOT}/profile/apps`)
    .then(response => response.data),
});

interface Props {
  pats: PromiseLoaderResponse<Linode.ManyResourceState<Linode.Token>>;
  appTokens: PromiseLoaderResponse<Linode.ManyResourceState<Linode.Token>>;
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

interface State {
  pats: Linode.Token[];
  form: FormState;
  dialog: DialogState;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class APITokens extends React.Component<CombinedProps, State> {
  static defaultState = {
    form: {
      mode: 'view' as DrawerMode,
      open: false,
      errors: undefined,
      id: undefined,
      values: {
        scopes: undefined,
        expiry: undefined,
        label: undefined,
      },
    },
    dialog: {
      open: false,
      id: undefined,
      label: undefined,
    },
  };

  state = {
    pats: pathOr([], ['response', 'data'], this.props.pats),
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
        <Typography variant="headline" className={classes.headline}>
          {title}
        </Typography>
        {type === 'Personal Access Token' &&
          <IconTextLink
            SideIcon={PlusSquare}
            onClick={() => this.openCreateDrawer()}
            text="Add a Personal Access Token"
            title="Add a Personal Access Token"
          />
        }
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tokens.map((token: Linode.Token) =>
                <TableRow key={token.id}>
                  <TableCell>
                    <Typography variant="subheading">
                      {token.label}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">
                      {type}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">
                      {token.created}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">
                      {token.expiry}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <APITokenMenu
                      openViewDrawer={() => { this.openViewDrawer(token); }}
                      openEditDrawer={() => { this.openEditDrawer(token); }}
                      openRevokeDialog={() => { this.openRevokeDialog(token.label, token.id); }}
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
      const created = moment(token.created);
      const expiry = moment(token.expiry);
      return {
        ...token,
        created: created > aLongTimeFromNow ? 'never' : created.fromNow(),
        expiry: expiry > aLongTimeFromNow ? 'never' : expiry.fromNow(),
      };
    });
  }

  requestTokens = () => {
    Axios.get(`${API_ROOT}/profile/tokens`)
    .then(response => response.data.data)
    .then(data => this.setState({ pats: data }));
  }

  openCreateDrawer = () => {
    this.setState({ form: {
      ...APITokens.defaultState.form,
      mode: 'create',
      open: true,
    }});
  }

  openViewDrawer = (token: Linode.Token) => {
    this.setState({ form: {
      ...APITokens.defaultState.form,
      mode: 'view',
      open: true,
      id: token.id,
      values: {
        scopes: token.scopes,
        expiry: token.expiry,
        label: token.label,
      },
    }});
  }

  openEditDrawer = (token: Linode.Token) => {
    this.setState({ form: {
      ...APITokens.defaultState.form,
      mode: 'edit',
      open: true,
      id: token.id,
      values: {
        scopes: token.scopes,
        expiry: token.expiry,
        label: token.label,
      },
    }});
  }

  closeDrawer = () => {
    const { form } = this.state;
    /* Only set { open: false } to avoid flicker of drawer appearance while closing */
    this.setState({ form: {
      ...form,
      open: false,
    }});
  }

  openRevokeDialog = (label: string, id: number) => {
    this.setState({ dialog: { open: true, label, id } });
  }

  closeRevokeDialog = () => {
    this.setState({ dialog: { ...this.state.dialog, id: undefined, open: false } });
  }

  revokeToken = () => {
    const { dialog } = this.state;
    Axios.delete(`${API_ROOT}/profile/tokens/${dialog.id}`)
    .then(() => { this.closeRevokeDialog(); })
    .then(() => this.requestTokens());
  }

  createToken = (scopes: string) => {
    if (scopes === '') {
      this.setState({ form: {
        ...this.state.form,
        errors: [
          { reason: 'You must select some permissions', field: 'scopes' },
        ],
      }});
      return;
    }

    const { form } = this.state;
    this.setState({ form: { ...form, values: { ...form.values, scopes } } }, () => {
      Axios.post(`${API_ROOT}/profile/tokens`, this.state.form.values)
      .then(() => { this.closeDrawer(); })
      .then(() => this.requestTokens())
      .catch((errResponse) => {
        this.setState({ form: {
          ...form,
          errors: path(['response', 'data', 'errors'], errResponse),
        }});
      });
    });
  }

  editToken = () => {
    const { form } = this.state;
    Axios.put(`${API_ROOT}/profile/tokens/${form.id}`, { label: form.values.label })
    .then(() => { this.closeDrawer(); })
    .then(() => this.requestTokens())
    .catch((errResponse) => {
      this.setState({ form: {
        ...form,
        errors: path(['response', 'data', 'errors'], errResponse),
      }});
    });
  }

  render() {
    const { form, dialog } = this.state;
    const appTokens = this.formatDates(
      pathOr([], ['response', 'data'], this.props.appTokens));
    const pats = this.formatDates(this.state.pats);

    return (
      <React.Fragment>
        {this.renderTokenTable(
          'Apps',
          'OAuth Client Token',
          appTokens,
        )}
        {this.renderTokenTable(
          'Personal Access Tokens',
          'Personal Access Token',
          pats,
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
          onChange={(key, value) => this.setState({ form:
            { ...form, values: { ...form.values, [key]: value } }})}
          onCreate={(scopes: string) => this.createToken(scopes)}
          onEdit={() => this.editToken()}
        />
        <ConfirmationDialog
          title={`Revoking ${dialog.label}`}
          open={dialog.open}
          actions={() => {
            return (
              <React.Fragment>
                <Button onClick={() => this.closeRevokeDialog()}>No</Button>
                <Button
                  variant="raised"
                  color="secondary"
                  className="destructive"
                  onClick={() => {
                    this.closeRevokeDialog();
                    this.revokeToken();
                  }}>
                  Yes
                </Button>
              </React.Fragment>
            );
          }}
          onClose={() => this.closeRevokeDialog()}
        >
          Are you sure you want to revoke this API Token?
        </ConfirmationDialog>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true })<Props>(APITokens);

export default preloaded(styled);
