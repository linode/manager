import { compose } from 'ramda';
import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import AddNewLink from 'src/components/AddNewLink';
import CircleProgress from 'src/components/CircleProgress';
import setDocs from 'src/components/DocsSidebar/setDocs';
import Grid from 'src/components/Grid';
import Table from 'src/components/Table';
import { getUsers } from 'src/services/account';

import ActionMenu from './UsersActionMenu';

type ClassNames = 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {}

interface State {
  users?: Linode.User[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UsersLanding extends React.Component<CombinedProps, State> {
  state: State = { };

  static docs: Linode.Doc[] = [
    {
      title: 'Accounts and Password',
      src: 'https://www.linode.com/docs/platform/accounts-and-passwords/',
      body: `Maintaining your user Linode Manager accounts, passwords, and
      contact information is just as important as administering your Linode.
      This guide shows you how to control access to the Linode Manager,
      update your contact information, and modify account passwords. Note
      that the information in this guide applies to the Linode Manager only,
      except for the section on resetting the root password.`,
    },
    {
      title: 'Linode Manager Security Controls',
      src: 'https://www.linode.com/docs/security/linode-manager-security-controls/',
      body: `The Linode Manager is the gateway to all of your Linode products
      and services, and you should take steps to protect it from unauthorized
      access. This guide documents several of Linode Manager’s features that
      can help mitigate your risk. Whether you’re worried about malicious
      users gaining access to your username and password, or authorized users
      abusing their access privileges, Linode Manager’s built-in security
      tools can help.`
    }
  ];

  componentDidMount() {
    getUsers()
      .then(({ data: users }) => {
        this.setState({
          users,
        });
      })
  }

  openForCreate = () => {
    return;
  }

  onProfile = () => {
    return;
  }

  onPermissions = () => {
    return;
  }

  onDelete = () => {
    return;
  }

  renderUserRow = (user: Linode.User) => {
    return (
      <TableRow key={user.username}>
        <TableCell>{user.username}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.restricted ? 'Restricted' : 'Unrestricted'}</TableCell>
        <TableCell>
          <ActionMenu
            onProfile={this.onProfile}
            onPermissions={this.onPermissions}
            onDelete={this.onDelete}
          />
        </TableCell>
      </TableRow>
    )
  }

  render() {
    const { classes } = this.props;
    const { users } = this.state;

    return (
      <React.Fragment>
        {users
          ? <React.Fragment>
              <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }} >
                <Grid item>
                  <Typography variant="headline" data-qa-title className={classes.title}>
                    Users
                  </Typography>
                </Grid>
                <Grid item>
                  <Grid container alignItems="flex-end">
                    <Grid item>
                      <AddNewLink
                        disabled
                        onClick={this.openForCreate}
                        label="Add a User"
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Paper>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Email Address</TableCell>
                      <TableCell>Restricted</TableCell>
                      <TableCell/>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map(user => this.renderUserRow(user))}
                  </TableBody>
                </Table>
              </Paper>
            </React.Fragment>
          : <CircleProgress />
        }
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  setDocs(UsersLanding.docs),
  styled,
)(UsersLanding);
