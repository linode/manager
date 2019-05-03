import { compose } from 'ramda';
import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import paginate, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { LinodeAPI } from 'src/documentation';
import {
  createOAuthClient,
  deleteOAuthClient,
  getOAuthClients,
  resetOAuthClientSecret,
  updateOAuthClient
} from 'src/services/account';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import ActionMenu from './OAuthClientActionMenu';
import OAuthFormDrawer from './OAuthFormDrawer';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  title: {
    margin: `0 0 ${theme.spacing.unit * 2}px`
  }
});

interface Props extends PaginationProps<Linode.OAuthClient> {}

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
  values: FormValues;
}

interface SecretState {
  open: boolean;
  value?: string;
}

interface State {
  secret?: SecretState;
  form: FormState;
}

type CombinedProps = Props & WithStyles<ClassNames> & SetDocsProps;

export class OAuthClients extends React.Component<CombinedProps, State> {
  static defaultState = {
    secret: {
      open: false,
      value: undefined
    },
    form: {
      id: undefined,
      open: false,
      edit: false,
      errors: undefined,
      values: {
        label: '',
        redirect_uri: '',
        public: false
      }
    }
  };

  mounted: boolean = false;

  state = {
    ...OAuthClients.defaultState
  };

  static defaultProps = {
    data: []
  };

  static docs = [LinodeAPI];

  reset = () => {
    this.setState({ ...OAuthClients.defaultState });
  };

  setForm = (fn: (v: FormState) => FormState): void => {
    this.setState(
      prevState => ({ ...prevState, form: fn(prevState.form) }),
      () => {
        scrollErrorIntoView();
      }
    );
  };

  deleteClient = (id: string) => {
    deleteOAuthClient(id).then(() => this.props.onDelete());
  };

  resetSecret = (id: string) => {
    resetOAuthClientSecret(id).then(({ secret }) => {
      if (!this.mounted) {
        return;
      }

      return this.setState({ secret: { open: true, value: secret } });
    });
  };

  startEdit = (
    id: string,
    label: string,
    redirectUri: string,
    isPublic: boolean
  ) => {
    this.setState({
      form: {
        edit: true,
        open: true,
        id,
        values: { label, redirect_uri: redirectUri, public: isPublic }
      }
    });
  };

  createClient = () => {
    const {
      form: { values }
    } = this.state;
    createOAuthClient(values)
      .then(data => {
        if (!this.mounted) {
          return;
        }

        return this.setState({
          secret: { value: data.secret, open: true },
          form: {
            open: false,
            edit: false,
            values: {
              label: '',
              redirect_uri: '',
              public: false
            }
          }
        });
      })
      .then(data => {
        if (!this.mounted) {
          return;
        }

        this.props.request();
      })
      .catch(errResponse => {
        if (!this.mounted) {
          return;
        }

        this.setForm(form => ({
          ...form,
          errors: getAPIErrorOrDefault(errResponse)
        }));
      });
  };

  editClient = () => {
    const {
      form: { id, values }
    } = this.state;
    if (!id) {
      return;
    }

    updateOAuthClient(id, values)
      .then(_ => {
        this.reset();
      })
      .then(_ => {
        this.props.request();
      })
      .catch(errResponse => {
        this.setForm(form => ({
          ...form,
          errors: getAPIErrorOrDefault(errResponse)
        }));
      });
  };

  toggleCreateDrawer = (v: boolean) =>
    this.setForm(form => ({ ...form, open: v }));

  renderContent = () => {
    const { data, error, loading } = this.props;

    if (error) {
      return (
        <TableRowError
          colSpan={6}
          message="We were unable to load your OAuth Clients."
        />
      );
    }

    if (loading) {
      return <TableRowLoading colSpan={6} />;
    }

    return data && data.length > 0 ? (
      this.renderRows(data)
    ) : (
      <TableRowEmptyState colSpan={6} />
    );
  };

  renderRows = (data: Linode.OAuthClient[]) => {
    return data.map(({ id, label, redirect_uri, public: isPublic, status }) => (
      <TableRow key={id} data-qa-table-row={label}>
        <TableCell parentColumn="Label" data-qa-oauth-label>
          {label}
        </TableCell>
        <TableCell parentColumn="Access" data-qa-oauth-access>
          {isPublic ? 'Public' : 'Private'}
        </TableCell>
        <TableCell parentColumn="ID" data-qa-oauth-id>
          {id}
        </TableCell>
        <TableCell parentColumn="Callback URL" data-qa-oauth-callback>
          {redirect_uri}
        </TableCell>
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
            onEdit={this.startEdit}
          />
        </TableCell>
      </TableRow>
    ));
  };

  componentDidMount() {
    this.mounted = true;
    this.props.request();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  openCreateDrawer = () => this.toggleCreateDrawer(true);

  render() {
    const { classes } = this.props;

    // TODO Need to unify internal & external usage of 'OAuth Clients'/'OAuth Apps'.
    // Currently in the context of profile, the term 'Oauth Client(s)' is referred to as 'app' or 'OAuth Apps' for user-facing displays.
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="OAuth Apps" />
        <Grid container justify="space-between" alignItems="flex-end">
          <Grid item>
            <Typography
              className={classes.title}
              variant="h2"
              data-qa-table={classes.title}
            >
              OAuth Apps
            </Typography>
          </Grid>
          <Grid item>
            <AddNewLink
              onClick={this.openCreateDrawer}
              label="Create OAuth App"
              data-qa-oauth-create
            />
          </Grid>
        </Grid>
        <Paper>
          <Table aria-label="List of OAuth Apps">
            <TableHead data-qa-table-head>
              <TableRow>
                <TableCell style={{ width: '20%' }}>Label</TableCell>
                <TableCell style={{ width: '20%' }}>Access</TableCell>
                <TableCell style={{ width: '20%' }}>ID</TableCell>
                <TableCell style={{ width: '20%' }}>Callback URL</TableCell>
                <TableCell style={{ width: '20%' }} />
              </TableRow>
            </TableHead>
            <TableBody>{this.renderContent()}</TableBody>
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
          <Notice
            typeProps={{ variant: 'body1' }}
            warning
            text={this.state.secret.value!}
          />
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

        <PaginationFooter
          page={this.props.page}
          pageSize={this.props.pageSize}
          count={this.props.count}
          handlePageChange={this.props.handlePageChange}
          handleSizeChange={this.props.handlePageSizeChange}
          eventCategory="oauth clients"
        />
      </React.Fragment>
    );
  }

  onChange = (key: string, value: any) =>
    this.setForm(form => ({
      ...form,
      values: { ...form.values, [key]: value }
    }));

  handleChangeLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(this.createNewFormState('label', e.target.value));
  };

  handleChangeRedirectURI = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(this.createNewFormState('redirect_uri', e.target.value));
  };

  handleChangePublic = () => {
    this.setState(
      this.createNewFormState('public', !this.state.form.values.public)
    );
  };

  createNewFormState = (
    newState: keyof FormValues,
    newValue: string | boolean
  ) => {
    return {
      form: {
        ...this.state.form,
        values: {
          ...this.state.form.values,
          [newState]: newValue
        }
      }
    };
  };

  renderClientSecretActions = () => (
    <Button type="primary" onClick={this.reset} data-qa-close-dialog>
      Got it!
    </Button>
  );
}

const styled = withStyles(styles);

const updatedRequest = (ownProps: any, params: any, filters: any) =>
  getOAuthClients(params, filters).then(response => response);

const paginated = paginate(updatedRequest);

const enhanced = compose<any, any, any, any>(
  styled,
  paginated,
  setDocs(OAuthClients.docs)
);

export default enhanced(OAuthClients);
