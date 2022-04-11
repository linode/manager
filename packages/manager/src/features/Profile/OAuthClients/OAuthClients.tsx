import {
  createOAuthClient,
  deleteOAuthClient,
  getOAuthClients,
  OAuthClient,
  resetOAuthClientSecret,
  updateOAuthClient,
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose } from 'recompose';
import AddNewLink from 'src/components/AddNewLink';
import Hidden from 'src/components/core/Hidden';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import paginate, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import TableSortCell from 'src/components/TableSortCell';
import { LinodeAPI } from 'src/documentation';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import Modals from './Modals';
import ActionMenu from './OAuthClientActionMenu';
import OAuthFormDrawer from './OAuthFormDrawer';

type ClassNames = 'root' | 'addNewWrapper';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    addNewWrapper: {
      '&.MuiGrid-item': {
        paddingTop: 0,
        paddingRight: 0,
      },
      [theme.breakpoints.down('sm')]: {
        marginRight: theme.spacing(),
      },
    },
  });

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Props extends PaginationProps<OAuthClient> {}

interface State {
  secretModalOpen: boolean;
  secretModalSuccessOpen: boolean;
  secret: string;
  clientLabel: string;
  clientID?: string;
  isPublic: boolean;
  redirectUri: string;
  deleteModalOpen: boolean;
  modalErrors?: APIError[];
  drawerOpen: boolean;
  drawerIsInEditMode: boolean;
  drawerErrors?: APIError[];
  isResetting: boolean;
  isDeleting: boolean;
  drawerLoading: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames> & SetDocsProps;

export class OAuthClients extends React.Component<CombinedProps, State> {
  defaultState: State = {
    modalErrors: undefined,
    deleteModalOpen: false,
    secret: '',
    clientLabel: '',
    secretModalOpen: false,
    secretModalSuccessOpen: false,
    redirectUri: '',
    isPublic: false,
    drawerErrors: undefined,
    drawerOpen: false,
    drawerIsInEditMode: false,
    isResetting: false,
    isDeleting: false,
    drawerLoading: false,
  };

  mounted: boolean = false;

  state: State = {
    ...this.defaultState,
  };

  static defaultProps = {
    data: [],
  };

  static docs = [LinodeAPI];

  openSecretModal = (id: string, label: string) =>
    this.setState({
      secretModalOpen: true,
      modalErrors: undefined,
      clientLabel: label,
      clientID: id,
    });

  openDeleteModal = (id: string, label: string) =>
    this.setState({
      deleteModalOpen: true,
      modalErrors: undefined,
      clientID: id,
      clientLabel: label,
    });

  closeModals = () =>
    this.setState({
      deleteModalOpen: false,
      secretModalOpen: false,
      secretModalSuccessOpen: false,
    });

  openDrawer = (isEditMode: boolean = false) => (
    isPublic: boolean = false,
    redirectUri: string = '',
    label: string = '',
    clientID?: string
  ) => {
    this.setState({
      drawerOpen: true,
      drawerErrors: undefined,
      drawerIsInEditMode: isEditMode,
      redirectUri,
      clientLabel: label,
      clientID,
      isPublic,
    });
  };

  closeDrawer = () => this.setState({ drawerOpen: false });

  deleteClient = (id?: string) => {
    if (!id) {
      return this.setState({
        modalErrors: [
          {
            reason: 'Something went wrong.',
          },
        ],
      });
    }
    this.setState({
      modalErrors: undefined,
      isDeleting: true,
    });
    deleteOAuthClient(id)
      .then(() => {
        this.props.onDelete();
        this.setState({ deleteModalOpen: false, isDeleting: false });
      })
      .catch((e: APIError[]) =>
        this.setState({ modalErrors: e, isDeleting: false })
      );
  };

  resetSecret = (id?: string) => {
    if (!id) {
      return this.setState({
        modalErrors: [
          {
            reason: 'Something went wrong.',
          },
        ],
      });
    }

    this.setState({
      modalErrors: undefined,
      isResetting: true,
    });
    resetOAuthClientSecret(id)
      .then(({ secret }) => {
        if (!this.mounted) {
          return;
        }

        return this.setState({
          ...this.defaultState,
          secret,
          secretModalSuccessOpen: true,
          isResetting: false,
        });
      })
      .catch((e: APIError[]) => {
        this.setState({ modalErrors: e, isResetting: false });
      });
  };

  createClient = () => {
    this.setState({
      drawerLoading: true,
    });

    createOAuthClient({
      label: this.state.clientLabel,
      redirect_uri: this.state.redirectUri,
      public: this.state.isPublic,
    })
      .then((data) => {
        if (!this.mounted) {
          return;
        }
        return this.setState({
          ...this.defaultState,
          secretModalSuccessOpen: true,
          secret: data.secret,
        });
      })
      .then((_) => {
        if (!this.mounted) {
          return;
        }

        this.props.request();
      })
      .catch((errResponse) => {
        if (!this.mounted) {
          return;
        }
        this.setState(
          {
            drawerErrors: getAPIErrorOrDefault(
              errResponse,
              'There was an error creating this OAuth Client.'
            ),
            drawerLoading: false,
          },
          () => scrollErrorIntoView()
        );
      });
  };

  editClient = () => {
    const { clientID, redirectUri, clientLabel } = this.state;

    if (!clientID || !redirectUri || !clientLabel) {
      return this.setState({
        drawerErrors: [
          {
            reason: 'Something went wrong.',
          },
        ],
      });
    }

    this.setState({ drawerLoading: true });

    updateOAuthClient(clientID, {
      label: clientLabel,
      redirect_uri: redirectUri,
    })
      .then((_) => {
        this.setState({ ...this.defaultState });
      })
      .then((_) => {
        this.props.request();
      })
      .catch((errResponse) => {
        this.setState(
          {
            drawerErrors: getAPIErrorOrDefault(
              errResponse,
              'Your OAuth App could not be updated.'
            ),
            drawerLoading: false,
          },
          () => scrollErrorIntoView()
        );
      });
  };

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
      return <TableRowLoading columns={5} />;
    }

    return data && data.length > 0 ? (
      this.renderRows(data)
    ) : (
      <TableRowEmptyState colSpan={6} />
    );
  };

  renderRows = (data: OAuthClient[]) => {
    return data.map(({ id, label, redirect_uri, public: isPublic }) => (
      <TableRow ariaLabel={label} key={id} data-qa-table-row={label}>
        <TableCell data-qa-oauth-label>{label}</TableCell>
        <Hidden xsDown>
          <TableCell data-qa-oauth-access>
            {isPublic ? 'Public' : 'Private'}
          </TableCell>
        </Hidden>
        <TableCell data-qa-oauth-id>{id}</TableCell>
        <Hidden xsDown>
          <TableCell data-qa-oauth-callback>{redirect_uri}</TableCell>
        </Hidden>
        <TableCell actionCell>
          <ActionMenu
            openSecretModal={this.openSecretModal}
            openDeleteModal={this.openDeleteModal}
            openEditDrawer={this.openDrawer(true)}
            label={label}
            isPublic={isPublic}
            redirectUri={redirect_uri}
            /*
             we can assume this is defined because we're doing null checking in renderContent()
            */
            clientID={id}
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

  render() {
    const { classes } = this.props;

    // TODO Need to unify internal & external usage of 'OAuth Clients'/'OAuth Apps'.
    // Currently in the context of profile, the term 'Oauth Client(s)' is referred to as 'app' or 'OAuth Apps' for user-facing displays.
    return (
      <>
        <DocumentTitleSegment segment="OAuth Apps" />
        <Grid
          className={`${classes.root} m0`}
          container
          alignItems="center"
          justifyContent="flex-end"
        >
          <Grid className={classes.addNewWrapper} item>
            <AddNewLink
              label="Add an OAuth App"
              onClick={() => this.openDrawer()(false)}
              data-qa-oauth-create
            />
          </Grid>
        </Grid>
        <Table aria-label="List of OAuth Apps">
          <TableHead data-qa-table-head>
            <TableRow>
              <TableSortCell
                active={this.props.orderBy === 'label'}
                label="label"
                direction={this.props.order}
                handleClick={this.props.handleOrderChange}
                style={{ width: '20%' }}
              >
                Label
              </TableSortCell>
              <Hidden xsDown>
                <TableCell>Access</TableCell>
              </Hidden>
              <TableCell style={{ width: '20%' }}>ID</TableCell>
              <Hidden xsDown>
                <TableCell style={{ width: '20%' }}>Callback URL</TableCell>
              </Hidden>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>{this.renderContent()}</TableBody>
        </Table>

        <Modals
          secret={this.state.secret}
          secretID={this.state.clientID}
          label={this.state.clientLabel}
          modalErrors={this.state.modalErrors}
          secretModalOpen={this.state.secretModalOpen}
          deleteModalOpen={this.state.deleteModalOpen}
          secretSuccessOpen={this.state.secretModalSuccessOpen}
          isResetting={this.state.isResetting}
          isDeleting={this.state.isDeleting}
          closeDialogs={this.closeModals}
          resetClient={this.resetSecret}
          deleteClient={this.deleteClient}
        />

        <OAuthFormDrawer
          edit={this.state.drawerIsInEditMode}
          open={this.state.drawerOpen}
          errors={this.state.drawerErrors}
          public={this.state.isPublic}
          label={this.state.clientLabel}
          redirect_uri={this.state.redirectUri}
          onClose={this.closeDrawer}
          loading={this.state.drawerLoading}
          onChangeLabel={this.handleChangeLabel}
          onChangeRedirectURI={this.handleChangeRedirectURI}
          onChangePublic={this.handleChangePublic}
          onSubmit={
            this.state.drawerIsInEditMode ? this.editClient : this.createClient
          }
        />

        <PaginationFooter
          page={this.props.page}
          pageSize={this.props.pageSize}
          count={this.props.count}
          handlePageChange={this.props.handlePageChange}
          handleSizeChange={this.props.handlePageSizeChange}
          eventCategory="oauth clients"
        />
      </>
    );
  }

  handleChangeLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ clientLabel: e.target.value });
  };

  handleChangeRedirectURI = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ redirectUri: e.target.value });
  };

  handleChangePublic = () => {
    this.setState({ isPublic: !this.state.isPublic });
  };
}

const styled = withStyles(styles);

const updatedRequest = (ownProps: any, params: any, filters: any) =>
  getOAuthClients(params, filters).then((response) => response);

const paginated = paginate(updatedRequest);

const enhanced = compose<CombinedProps, {}>(
  styled,
  paginated,
  setDocs(OAuthClients.docs)
);

export default enhanced(OAuthClients);
