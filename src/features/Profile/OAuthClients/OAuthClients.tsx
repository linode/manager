import { compose, path } from 'ramda';
import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Preload, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import { createOAuthClient, deleteOAuthClient, getOAuthClients, resetOAuthClientSecret, updateOAuthClient } from 'src/services/account';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import ActionMenu from './OAuthClientActionMenu';
import OAuthFormDrawer from './OAuthFormDrawer';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  title: {
    margin: `0 0 ${theme.spacing.unit * 2}px`,
  },
});

interface Props {
  data: PromiseLoaderResponse<Linode.OAuthClient[]>;
}

interface FormValues {
  label: string;
  redirect_uri: string;
  public: boolean;
}

interface FormState {
  edit: boolean;
  open: boolean;
  errors?: Linode.ApiFieldError[];
  id?: string;
  values: FormValues
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
        label: '',
        redirect_uri: '',
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

  startEdit = (id: string, label: string, redirectUri: string, isPublic: boolean) => {
    this.setState({
      form: {
        edit: true,
        open: true,
        id,
        values: { label, redirect_uri: redirectUri, public: isPublic },
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
              label: '',
              redirect_uri: '',
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
        <TableCell parentColumn="Label" data-qa-oauth-label>{label}</TableCell>
        <TableCell parentColumn="Access" data-qa-oauth-access>{isPublic ? 'Public' : 'Private'}</TableCell>
        <TableCell parentColumn="ID" data-qa-oauth-id>{id}</TableCell>
        <TableCell parentColumn="Callback URL" data-qa-oauth-callback>{redirect_uri}</TableCell>
        <TableCell>
          <ActionMenu
            id={id}
            editPayload={{
              label,
              redirect_uri,
              isPublic
            }}
            onDelete={this.deleteClient}
            onReset={this.resetSecret}
            onEdit={this.startEdit} />
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

  openCreateDrawer = () => this.toggleCreateDrawer(true);

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="OAuth Clients" />
        <Grid
          container
          justify="space-between"
          alignItems="flex-end"
        >
          <Grid item>
            <Typography role="header" className={classes.title} variant="title" data-qa-table={classes.title}>
              OAuth Clients
            </Typography>
          </Grid>
          <Grid item>
            <AddNewLink
              onClick={this.openCreateDrawer}
              label="Create an OAuth Client"
              data-qa-oauth-create
            />
          </Grid>
        </Grid>
        <Paper>
          <Table aria-label="List of OAuth Clients">
            <TableHead data-qa-table-head>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Access</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Callback URL</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderRows()}
            </TableBody>
          </Table>
        </Paper>

        <ConfirmationDialog
          title="Client Secret"
          actions={this.renderClientSecretActions}
          open={this.state.secret.open}
          onClose={this.reset}
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
          onClose={this.reset}
          onChangeLabel={this.handleChangeLabel}
          onChangeRedirectURI={this.handleChangeRedirectURI}
          onChangePublic={this.handleChangePublic}
          onSubmit={this.state.form.edit ? this.editClient : this.createClient}
        />
      </React.Fragment>
    );
  }

  onChange = (key: string, value: any) => this.setForm(form => ({
    ...form,
    values: { ...form.values, [key]: value },
  }));

  handleChangeLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(this.createNewFormState('label', e.target.value))
  }

  handleChangeRedirectURI = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(this.createNewFormState('redirect_uri', e.target.value))
  }

  handleChangePublic = () => {
    this.setState(this.createNewFormState('public', !this.state.form.values.public))
  }

  createNewFormState = (newState: keyof FormValues, newValue: string | boolean) => {
    return {
      form: {
        ...this.state.form,
        values: {
          ...this.state.form.values,
          [newState]: newValue
        }
      }
    }
  }

  renderClientSecretActions = () => (
    <Button type="primary" onClick={this.reset} data-qa-close-dialog>Got it!</Button>
  );
}

const styled = withStyles(styles, { withTheme: true });

const preloaded = Preload({
  data: () => getOAuthClients()
    .then(response => response.data),
});

const enhanced = compose<any, any, any>(styled, preloaded);

export default enhanced(OAuthClients);
