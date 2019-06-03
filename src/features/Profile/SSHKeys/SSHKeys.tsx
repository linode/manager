import * as moment from 'moment-timezone';
import { compose } from 'ramda';
import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import paginate, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableHeader from 'src/components/TableHeader';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import DeleteSSHKeyDialog from 'src/features/Profile/SSHKeys/DeleteSSHKeyDialog';
import SSHKeyActionMenu from 'src/features/Profile/SSHKeys/SSHKeyActionMenu';
import { getSSHKeys } from 'src/services/profile';
import fingerprint from 'src/utilities/ssh-fingerprint';
import SSHKeyCreationDrawer from './SSHKeyCreationDrawer';

type ClassNames = 'root';

const styles = (theme: Theme) =>
  createStyles({
  root: {}
});

interface SSHKey {
  id: number;
  label: string;
  ssh_key: string;
  created: string;
}

interface Props extends PaginationProps<ExtendedSSHKey> {}

interface ConnectedProps {
  timezone: string;
}

type ExtendedSSHKey = SSHKey & { fingerprint: string };

interface State {
  confirmDelete: {
    open: boolean;
    id?: number;
    label?: string;
  };
  creationDrawer: {
    open: boolean;
  };
}

type CombinedProps = Props & ConnectedProps & WithStyles<ClassNames>;

export class SSHKeys extends React.Component<CombinedProps, State> {
  state: State = {
    confirmDelete: {
      open: false,
      id: undefined,
      label: undefined
    },
    creationDrawer: {
      open: false
    }
  };

  static docs: Linode.Doc[] = [
    {
      body: `Public key authentication provides SSH users with the convenience of logging in to
      their Linodes without entering their passwords. SSH keys are also more secure than passwords,
      because the private key used to secure the connection is never shared.`,
      src:
        'https://linode.com/docs/security/authentication/use-public-key-authentication-with-ssh/',
      title: 'Use Public Key Authentication with SSH'
    }
  ];

  componentDidMount() {
    this.props.request();
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <TableHeader title="SSH Keys" action={this.headerAction} />
        <Paper className={classes.root}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell data-qa-label-column>Label</TableCell>
                <TableCell data-qa-key-column>Key</TableCell>
                <TableCell data-qa-created-column>Created</TableCell>
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
          eventCategory="ssh keys"
        />
        <DeleteSSHKeyDialog
          id={this.state.confirmDelete.id}
          label={this.state.confirmDelete.label}
          open={this.state.confirmDelete.open}
          onSuccess={this.handleSuccessfulDeletion}
          closeDialog={this.handleCancelDeletion}
        />
        <SSHKeyCreationDrawer
          open={this.state.creationDrawer.open}
          onSuccess={this.handleSuccessfulCreation}
          onCancel={this.closeCreationDrawer}
        />
      </React.Fragment>
    );
  }

  renderContent = () => {
    const { loading, error, data, count } = this.props;

    if (loading) {
      return SSHKeys.renderLoading();
    }

    if (error) {
      return SSHKeys.renderError(error);
    }

    if (data && count > 0) {
      return this.renderData(data);
    }

    return SSHKeys.renderEmptyState();
  };

  headerAction = () => {
    return (
      <AddNewLink label="Add a SSH Key" onClick={this.openCreationDrawer} />
    );
  };

  static renderLoading = () => {
    return <TableRowLoading colSpan={4} />;
  };

  static renderEmptyState = () => {
    return <TableRowEmptyState colSpan={4} />;
  };

  static renderError = (e: Error) => {
    return (
      <TableRowError
        colSpan={4}
        message={`Unable to load SSH keys. Please try again.`}
      />
    );
  };

  renderData = (keys: ExtendedSSHKey[]) => {
    return keys.map(key => (
      <TableRow data-qa-content-row={key.label} key={key.id}>
        <TableCell parentColumn="Label">{key.label}</TableCell>
        <TableCell parentColumn="Key" data-qa-public-key>
          <Typography variant="body1">{key.ssh_key.slice(0, 26)}</Typography>
          <Typography variant="body1">
            Fingerprint: {key.fingerprint}
          </Typography>
        </TableCell>
        <TableCell parentColumn="Created" data-qa-key-created>
          {key.created}
        </TableCell>
        <TableCell>
          <SSHKeyActionMenu
            id={key.id}
            label={key.label}
            onDelete={this.displayConfirmDeleteDialog}
          />
        </TableCell>
      </TableRow>
    ));
  };

  displayConfirmDeleteDialog = (id: number, label: string) => {
    this.setState({ confirmDelete: { open: true, id, label } });
  };

  handleCancelDeletion = () => {
    this.setState(prevState => ({
      confirmDelete: { ...prevState.confirmDelete, open: false }
    }));
  };

  handleSuccessfulDeletion = () => {
    this.setState(
      prevState => ({
        confirmDelete: { ...prevState.confirmDelete, open: false }
      }),
      () => this.props.request()
    );
  };

  handleSuccessfulCreation = () => {
    this.closeCreationDrawer();
    this.props.request();
  };

  openCreationDrawer = () => {
    this.setState({ creationDrawer: { open: true } });
  };

  closeCreationDrawer = () => {
    this.setState({ creationDrawer: { open: false } });
  };
}

const updateResponseData = (keys: Linode.SSHKey[]) =>
  keys.map(key => ({
    ...key,
    fingerprint: fingerprint(key.ssh_key),
    created: moment.utc(key.created).fromNow()
  }));

const styled = withStyles(styles);

const documented = setDocs(SSHKeys.docs);

const updatedRequest = (ownProps: any, params: any, filters: any) =>
  getSSHKeys(params, filters).then(response => ({
    ...response,
    data: updateResponseData(response.data)
  }));

const paginated = paginate(updatedRequest);

const enhanced = compose<any, any, any, any>(
  paginated,
  styled,
  documented
);

export default enhanced(SSHKeys);
