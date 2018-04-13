import * as React from 'react';
import Axios from 'axios';
import { compose, path } from 'ramda';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import TableBody from 'material-ui/Table/TableBody';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import Button from 'material-ui/Button';

import Preload, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import IconTextLink from 'src/components/IconTextLink';

import PlusSquare from 'src/assets/icons/plus-square.svg';
import { API_ROOT } from 'src/constants';
import Table from 'src/components/Table';
import ActionMenu from './OAuthClientActionMenu';
import OAuthFormDrawer from './OAuthFormDrawer';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Notice from 'src/components/Notice';

const apiPath = `${API_ROOT}/account/oauth-clients`;

interface OAuthClient {
  id: string;
  label: string;
  redirect_uri: string;
  thumbnail_url: string;
  public: boolean;
  status: 'disabled' | 'active' | 'suspended';
}

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    margin: `${theme.spacing.unit * 2}px 0`,
  },
});

interface Props {
  data: PromiseLoaderResponse<OAuthClient[]>;
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
  data: OAuthClient[];
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
    this.setState(prevState => ({ ...prevState, form: fn(prevState.form) }));
  }

  requestClients = () => {
    Axios.get(apiPath)
      .then(response => response.data.data)
      .then(data => this.setState({ data }));
  }

  deleteClient = (id: string) => {
    Axios.delete(`${apiPath}/${id}`)
      .then(() => this.requestClients());
  }

  resetSecret = (id: string) => {
    Axios.post(`${apiPath}/${id}/reset-secret`)
      .then(({ data: { secret } }) => {
        this.setState({ secret: { open: true, value: secret } });
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
    Axios.post(apiPath, values)
      .then((response) => {
        this.setState({
          secret: { value: response.data.secret, open: true },
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

  editClient = () => {
    const { form: { id, values } } = this.state;

    Axios.put(`${apiPath}/${id}`, values)
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
            <IconTextLink
              SideIcon={PlusSquare}
              onClick={() => this.toggleCreateDrawer(true)}
              text="Create an OAuth Client"
              title="Create an OAuth Client"
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
              onClick={() => this.reset() }
              data-qa-close-dialog
            >
              OK
            </Button>}
          open={this.state.secret.open}
          onClose={() => this.reset() }
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
  data: () => Axios.get(apiPath)
    .then(response => response.data.data),
});

const enhanced = compose<any, any, any>(styled, preloaded);

export default enhanced(OAuthClients);
