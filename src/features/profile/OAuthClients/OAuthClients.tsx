import * as React from 'react';

import { compose, path } from 'ramda';

import { StyleRulesCallback, Theme, withStyles,  WithStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';


import {
  createOAuthClient,
  deleteOAuthClient,
  getOAuthClients,
  resetOAuthClientSecret,
  updateOAuthClient,
} from 'src/services/account';

import AddNewLink from 'src/components/AddNewLink';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Preload, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import Table from 'src/components/Table';

import ActionMenu from './OAuthClientActionMenu';
import OAuthFormDrawer from './OAuthFormDrawer';

import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    margin: `${theme.spacing.unit * 2}px 0`,
  },
});

interface Props {
  data: PromiseLoaderResponse<Linode.OAuthClient[]>;
}

interface FormState {
  edit: boolean;
  open: boolean;
  errors?: Linode.ApiFieldError[];
  id?: string;
  values: {
    label?: string;
    redirect_uri?: string;
    public: boolean;
  };
}

interface SecretState {
  open: boolean;
  value?: string;
}

interface State {
  data: Linode.OAuthClient[];
  secret?: SecretState;
  form: FormState;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class OAuthClients extends React.Component<CombinedProps, State> {
  static defaultState = {
    secret: {
      open: false,
      value: undefined,
    },
    form: {
      id: undefined,
      open: false,
      edit: false,
      errors: undefined,
      values: {
        label: undefined,
        redirect_uri: undefined,
        public: false,
      },
    },
  };

  mounted: boolean = false;

  state = {
    data: this.props.data.response,
    ...OAuthClients.defaultState,
  };

  static defaultProps = {
    data: [],
  };

  reset = () => {
    this.setState({ ...OAuthClients.defaultState });
  }

  setForm = (fn: (v: FormState) => FormState): void => {
    this.setState(prevState => ({ ...prevState, form: fn(prevState.form) }), () => {
      scrollErrorIntoView();
    });
  }

  requestClients = () => {
    getOAuthClients()
      .then(response => response.data)
      .then((data) => {
        if (!this.mounted) { return; }

        return this.setState({ data });
      });
  }

  deleteClient = (id: string) => {
    deleteOAuthClient(id)
      .then(() => this.requestClients());
  }

  resetSecret = (id: string) => {
    resetOAuthClientSecret(id)
      .then(({ secret }) => {
        if (!this.mounted) { return; }

        return this.setState({ secret: { open: true, value: secret } });
      });
  }

  startEdit = (id: string, label: string, redirect_uri: string, isPublic: boolean) => {
    this.setState({
      form: {
        edit: true,
        open: true,
        id,
        values: { label, redirect_uri, public: isPublic },
      },
    });
  }

  createClient = () => {
    const { form: { values } } = this.state;
    createOAuthClient(values)
      .then((data) => {
        if (!this.mounted) { return; }

        return this.setState({
          secret: { value: data.secret, open: true },
          form: {
            open: false,
            edit: false,
            values: {
              label: undefined,
              redirect_uri: undefined,
              public: false,
            },
          },
        });
      })
      .then((data) => {
        if (!this.mounted) { return; }

        this.requestClients();
      })
      .catch((errResponse) => {
        if (!this.mounted) { return; }

        this.setForm(form => ({
          ...form,
          errors: path(['response', 'data', 'errors'], errResponse),
        }));
      });
  }

  editClient = () => {
    const { form: { id, values } } = this.state;
    if (!id) { return; }

    updateOAuthClient(id, values)
      .then((response) => {
        this.reset();
      })
      .then((response) => {
        this.requestClients();
      })
      .catch((errResponse) => {
        this.setForm(form => ({
          ...form,
          errors: path(['response', 'data', 'errors'], errResponse),
        }));
      });
  }

  toggleCreateDrawer = (v: boolean) => this.setForm(form => ({ ...form, open: v }));

  renderRows = () => {
    const { data } = this.state;

    return data.map(({ id, label, redirect_uri, public: isPublic, status }) => (
      <TableRow key={id} data-qa-table-row={label}>
        <TableCell data-qa-oauth-label>{label}</TableCell>
        <TableCell data-qa-oauth-access>{isPublic ? 'Public' : 'Private'}</TableCell>
        <TableCell data-qa-oauth-id>{id}</TableCell>
        <TableCell data-qa-oauth-callback>{redirect_uri}</TableCell>
        <TableCell>
          <ActionMenu
            onDelete={() => this.deleteClient(id)}
            onReset={() => this.resetSecret(id)}
            onEdit={() => this.startEdit(id, label, redirect_uri, isPublic)}
            id={id} />
        </TableCell>
      </TableRow>
    ));
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Grid
          container
          justify="space-between"
          alignItems="flex-end"
          style={{ marginTop: 8 }}
        >
          <Grid item>
            <Typography className={classes.title} variant="title" data-qa-table={classes.title}>
              OAuth Clients
            </Typography>
          </Grid>
          <Grid item>
            <AddNewLink
              onClick={() => this.toggleCreateDrawer(true)}
              label="Create an OAuth Client"
              data-qa-oauth-create
            />
          </Grid>
        </Grid>
        <Paper>
          <Table>
            <TableHead data-qa-table-head>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Access</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Callback URL</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderRows()}
            </TableBody>
          </Table>
        </Paper>

        <ConfirmationDialog
          title="Client Secret"
          actions={() =>
            <Button
              variant="raised"
              color="primary"
              onClick={() => this.reset()}
              data-qa-close-dialog
            >
              OK
            </Button>}
          open={this.state.secret.open}
          onClose={() => this.reset()}
        >
          <Typography variant="body1">
            {`Here is your client secret! Store it securely, as it won't be shown again.`}
          </Typography>
          <Notice typeProps={{ variant: 'caption' }} warning text={this.state.secret.value!} />
        </ConfirmationDialog>

        <OAuthFormDrawer
          edit={this.state.form.edit}
          open={this.state.form.open}
          errors={this.state.form.errors}
          public={this.state.form.values.public}
          label={this.state.form.values.label}
          redirect_uri={this.state.form.values.redirect_uri}
          onClose={() => { this.reset(); }}
          onChange={(key, value) =>
            this.setForm(form => ({ ...form, values: { ...form.values, [key]: value } }))}
          onSubmit={() => this.state.form.edit ? this.editClient() : this.createClient()}
        />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const preloaded = Preload({
  data: () => getOAuthClients()
    .then(response => response.data),
});

const enhanced = compose<any, any, any>(styled, preloaded);

export default enhanced(OAuthClients);
