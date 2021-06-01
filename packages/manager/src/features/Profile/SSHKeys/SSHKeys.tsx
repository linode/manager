import { getSSHKeys, SSHKey } from '@linode/api-v4/lib/profile';
import * as React from 'react';
import { compose } from 'recompose';
import AddNewLink from 'src/components/AddNewLink/AddNewLink_CMR';
import Hidden from 'src/components/core/Hidden';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import paginate, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import DeleteSSHKeyDialog from 'src/features/Profile/SSHKeys/DeleteSSHKeyDialog';
import SSHKeyActionMenu from 'src/features/Profile/SSHKeys/SSHKeyActionMenu';
import { parseAPIDate } from 'src/utilities/date';
import fingerprint from 'src/utilities/ssh-fingerprint';
import SSHKeyCreationDrawer from './SSHKeyCreationDrawer';

type ClassNames =
  | 'root'
  | 'sshKeysHeader'
  | 'headline'
  | 'addNewWrapper'
  | 'createdCell'
  | 'actionCell';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.color.white,
    },
    sshKeysHeader: {
      margin: 0,
      width: '100%',
    },
    headline: {
      marginTop: 8,
      marginBottom: 8,
      marginLeft: 15,
      lineHeight: '1.5rem',
    },
    addNewWrapper: {
      '&.MuiGrid-item': {
        padding: 5,
      },
    },
    createdCell: {
      width: '16%',
    },
    actionCell: {
      textAlign: 'right',
    },
  });

// eslint-disable-next-line @typescript-eslint/no-empty-interface
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
      label: undefined,
    },
    creationDrawer: {
      open: false,
    },
  };

  static docs: Linode.Doc[] = [
    {
      body: `Public key authentication provides SSH users with the convenience of logging in to
      their Linodes without entering their passwords. SSH keys are also more secure than passwords,
      because the private key used to secure the connection is never shared.`,
      src:
        'https://linode.com/docs/security/authentication/use-public-key-authentication-with-ssh/',
      title: 'Use Public Key Authentication with SSH',
    },
  ];

  componentDidMount() {
    this.props.request();
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <DocumentTitleSegment segment="SSH Keys" />
        <Grid
          className={classes.sshKeysHeader}
          container
          alignItems="flex-end"
          justify="space-between"
        >
          <Grid className="p0" item>
            <Typography variant="h3" className={classes.headline}>
              SSH Keys
            </Typography>
          </Grid>
          <Grid className={classes.addNewWrapper} item>
            <AddNewLink
              label="Add a SSH Key"
              onClick={this.openCreationDrawer}
            />
          </Grid>
        </Grid>
        <Table>
          <TableHead data-qa-table-head>
            <TableRow>
              <TableCell data-qa-label-column>Label</TableCell>
              <TableCell data-qa-key-column>Key</TableCell>
              <Hidden xsDown>
                <TableCell data-qa-created-column>Created</TableCell>
              </Hidden>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>{this.renderContent()}</TableBody>
        </Table>
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
      </div>
    );
  }

  renderContent = () => {
    const { loading, error, data, count } = this.props;

    if (loading) {
      return SSHKeys.renderLoading();
    }

    if (error) {
      return SSHKeys.renderError();
    }

    if (data && count > 0) {
      return this.renderData(data);
    }

    return SSHKeys.renderEmptyState();
  };

  static renderLoading = () => {
    return <TableRowLoading colSpan={4} />;
  };

  static renderEmptyState = () => {
    return <TableRowEmptyState colSpan={4} />;
  };

  static renderError = () => {
    return (
      <TableRowError
        colSpan={4}
        message="Unable to load SSH keys. Please try again."
      />
    );
  };

  renderData = (keys: ExtendedSSHKey[]) => {
    const { classes } = this.props;
    return keys.map((key) => (
      <TableRow data-qa-content-row={key.label} key={key.id}>
        <TableCell>{key.label}</TableCell>
        <TableCell data-qa-public-key>
          <Typography variant="body1">{key.ssh_key.slice(0, 26)}</Typography>
          <Typography variant="body1">
            Fingerprint: {key.fingerprint}
          </Typography>
        </TableCell>
        <Hidden xsDown>
          <TableCell data-qa-key-created className={classes.createdCell}>
            {key.created}
          </TableCell>
        </Hidden>
        <TableCell className={classes.actionCell}>
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
    this.setState((prevState) => ({
      confirmDelete: { ...prevState.confirmDelete, open: false },
    }));
  };

  handleSuccessfulDeletion = () => {
    this.setState(
      (prevState) => ({
        confirmDelete: { ...prevState.confirmDelete, open: false },
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

const updateResponseData = (keys: SSHKey[]) =>
  keys.map((key) => ({
    ...key,
    fingerprint: fingerprint(key.ssh_key),
    created: parseAPIDate(key.created).toRelative(),
  }));

const documented = setDocs(SSHKeys.docs);

const updatedRequest = (ownProps: any, params: any, filters: any) =>
  getSSHKeys(params, filters).then((response) => ({
    ...response,
    data: updateResponseData(response.data),
  }));

const styled = withStyles(styles);

const paginated = paginate(updatedRequest);

const enhanced = compose<CombinedProps, {}>(paginated, documented, styled);

export default enhanced(SSHKeys);
