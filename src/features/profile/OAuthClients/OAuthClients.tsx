import * as React from 'react';
import Axios from 'axios';
import { compose } from 'ramda';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Table from 'material-ui/Table';
import TableBody from 'material-ui/Table/TableBody';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import Button from 'material-ui/Button';

import Preload, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import IconTextLink from 'src/components/IconTextLink';

import PlusSquare from 'src/assets/icons/plus-square.svg';
import { API_ROOT } from 'src/constants';
import ActionMenu from './OAuthClientActionMenu';
import OAuthCreationDrawer from './OAuthCreationDrawer';
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
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {
  data: PromiseLoaderResponse<OAuthClient[]>;
}
interface Create {
  label?: string;
  redirect_uri?: string;
  public: boolean;
}

interface State {
  data: OAuthClient[];
  createDrawerOpen: boolean;
  secretDisplay: boolean;
  secret?: string;
  create: Create;
  createErrors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class OAuthClients extends React.Component<CombinedProps, State> {
  static defaultState = {
    createDrawerOpen: false,
    secretDisplay: false,
    secret: undefined,
    createErrors: undefined,
    create: {
      label: undefined,
      redirect_uri: undefined,
      public: false,
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

  setCreate = (fn: (v: Create) => Create): void => {
    this.setState(prevState => ({
      ...prevState,
      create: fn(prevState.create),
    }));
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
        this.setState({ secretDisplay: true, secret });
      });
  }

  createClient = () => {
    Axios.post(apiPath, this.state.create)
      .then((response) => {
        this.setState({
          secret: response.data.secret,
          secretDisplay: true,
          createDrawerOpen: false,
          create: {
            label: undefined,
            redirect_uri: undefined,
            public: false,
          },
        });
      })
      .then((response) => {
        this.requestClients();
      })
      .catch(error => this.setState({
        createErrors: error.response && error.response.data && error.response.data.errors,
      }));
  }

  toggleCreateDrawer = (v: boolean) => this.setState({ createDrawerOpen: v });

  renderRows = () => {
    const { data } = this.state;

    return data.map(({ id, label, redirect_uri, public: isPublic, status }) => (
      <TableRow key={id}>
        <TableCell>{label}</TableCell>
        <TableCell>{isPublic ? 'Public' : 'Private'}</TableCell>
        <TableCell>{id}</TableCell>
        <TableCell>{redirect_uri}</TableCell>
        <TableCell>
          <ActionMenu
            onDelete={() => this.deleteClient(id)}
            onReset={() => this.resetSecret(id)}
            id={id} />
        </TableCell>
      </TableRow>
    ));
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Typography className={classes.title} component="div" variant="headline">
          OAuth Clients
        </Typography>
        <Paper>
          <Table>
            <TableHead>
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
        <IconTextLink
          SideIcon={PlusSquare}
          onClick={() => this.toggleCreateDrawer(true)}
          text="Create an OAuth Client"
          title="Link title"
        />

        <ConfirmationDialog
          title="Client Secret"
          actions={() =>
            <Button
              variant="raised"
              color="primary"
              onClick={() => this.setState({ secretDisplay: false, secret: undefined })}
            >
            OK
            </Button>}
          open={this.state.secretDisplay}
          onClose={() => this.setState({ secretDisplay: false, secret: undefined })}
        >
          <Typography variant="body1">
            {`Here is your client secret! Store it securely, as it won't be shown again.`}
          </Typography>
          <Notice typeProps={{ variant: 'caption' }} warning text={this.state.secret!} />
        </ConfirmationDialog>

        <OAuthCreationDrawer
          open={this.state.createDrawerOpen}
          errors={this.state.createErrors}
          public={this.state.create.public}
          onClose={() => { this.toggleCreateDrawer(false); this.reset(); }}
          onCancel={() => { this.toggleCreateDrawer(false); this.reset(); }}
          onChange={(key, value) => this.setCreate(create => ({ ...create, [key]: value }))}
          onSubmit={() => this.createClient()}
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
