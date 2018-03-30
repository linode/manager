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
import Preload, { PromiseLoaderResponse } from 'src/components/PromiseLoader';

import { API_ROOT } from 'src/constants';
import ActionMenu from './OAuthClientActionMenu';

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

interface State { }

type CombinedProps = Props & WithStyles<ClassNames>;

class OAuthClients extends React.Component<CombinedProps, State> {
  state = { data: this.props.data };

  static defaultProps = {
    data: [],
  };

  request = () => {
    Axios.get(apiPath)
      .then(response => response.data.data)
      .then(data => this.setState({ data }));
  }

  onDelete = (id: string) => {
    Axios.delete(`${apiPath}/${id}`)
      .then(() => this.request());
  }

  renderRows = () => {
    const { data: { response } } = this.props;

    return response.map(({ id, label, redirect_uri, public: isPublic, status }) => (
      <TableRow key={id}>
        <TableCell>{label}</TableCell>
        <TableCell>{isPublic ? 'Public' : 'Private'}</TableCell>
        <TableCell>{id}</TableCell>
        <TableCell>{redirect_uri}</TableCell>
        <TableCell>
          <ActionMenu
            onDelete={() => this.onDelete(id)}
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
