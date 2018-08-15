import * as moment from 'moment-timezone';
import { compose } from 'ramda';
import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import AddNewLink from 'src/components/AddNewLink';
import setDocs from 'src/components/DocsSidebar/setDocs';
import paginate, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableHeader from 'src/components/TableHeader';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import SSHKeyActionMenu from 'src/features/Profile/SSHKeys/SSHkeyActionMenu';
import { getSSHKeys } from 'src/services/profile';
import fingerprint from 'src/utilities/ssh-fingerprint';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface SSHKey {
  id: number;
  label: string;
  ssh_key: string;
  created: string;
}

interface Props extends PaginationProps<ExtendedSSHKey> { }

interface ConnectedProps {
  timezone: string;
}

type ExtendedSSHKey = SSHKey & { fingerprint: string };

interface State { }

type CombinedProps = Props & ConnectedProps & WithStyles<ClassNames>;

class SSHKeys extends React.Component<CombinedProps, State> {
  state: State = {};

  static docs: Linode.Doc[] = [
    {
      body: `Public key authentication provides SSH users with the convenience of logging in to
      their Linodes without entering their passwords. SSH keys are also more secure than passwords,
      because the private key used to secure the connection is never shared.`,
      src: 'https://linode.com/docs/security/authentication/use-public-key-authentication-with-ssh/',
      title: 'Use Public Key Authentication with SSH',
    },
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
                <TableCell>Label</TableCell>
                <TableCell>Key</TableCell>
                <TableCell>Table</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderContent()}
            </TableBody>
          </Table>
        </Paper>
        <PaginationFooter
          page={this.props.page}
          pageSize={this.props.pageSize}
          count={this.props.count}
          handlePageChange={this.props.handlePageChange}
          handleSizeChange={this.props.handlePageSizeChange}
        />
      </React.Fragment>
    );
  }

  renderContent = () => {
    const { loading, error, result, count } = this.props;

    if (loading) {
      return SSHKeys.renderLoading();
    }

    if (error) {
      return SSHKeys.renderError(error);
    }

    if (result && count > 0) {
      return SSHKeys.renderData(result);
    }

    return SSHKeys.renderEmptyState();
  };

  static renderLoading = () => {
    return (
      <TableRowLoading colSpan={4} />
    );
  };

  static renderEmptyState = () => {
    return (
      <TableRowEmptyState colSpan={4} />
    );
  };

  static renderError = (e: Error) => {
    return (
      <TableRowError colSpan={4} message={`Unable to load SSH keys. Please try again.`} />
    );
  };

  static renderData = (keys: ExtendedSSHKey[]) => {
    return keys.map(key =>
      <TableRow key={key.id}>
        <TableCell>{key.label}</TableCell>
        <TableCell>
          <Typography>{key.ssh_key.slice(0, 26)}</Typography>
          <Typography>Fingerprint: {key.fingerprint}</Typography>
        </TableCell>
        <TableCell>{key.created}</TableCell>
        <TableCell>
          <SSHKeyActionMenu sshKeyID={key.id} />
        </TableCell>
      </TableRow>
    );
  };

  headerAction = () => {
    return (
      <AddNewLink label='Add a SSH Key' onClick={() => null} disabled />
    );
  };
}

const updateResponseData = (keys: Linode.SSHKey[]) => keys.map((key) => ({
  ...key,
  fingerprint: fingerprint(key.ssh_key),
  created: moment.utc(key.created).fromNow(),
}));

const styled = withStyles(styles, { withTheme: true });

const documented = setDocs(SSHKeys.docs);

const updatedRequest = (p: any, f: any) => getSSHKeys(p, f)
  .then((response) => ({
    ...response,
    data: updateResponseData(response.data),
  }));

const paginated = paginate(updatedRequest);

const enhanced = compose<any, any, any, any>(
  paginated,
  styled,
  documented,
);

export default enhanced(SSHKeys);

