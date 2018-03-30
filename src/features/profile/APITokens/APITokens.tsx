import * as React from 'react';
import Axios from 'axios';
import { pathOr } from 'ramda';

import { withStyles, Theme, WithStyles, StyleRulesCallback } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Table from 'material-ui/Table';
import TableBody from 'material-ui/Table/TableBody';
import TableCell from 'material-ui/Table/TableCell';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';

import { API_ROOT } from 'src/constants';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';

type ClassNames = 'headline';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => {
  return ({
    headline: {
      marginTop: theme.spacing.unit * 2,
      marginBottom: theme.spacing.unit * 2,
    },
  });
};

const preloaded = PromiseLoader<Props>({
  tokens: () => Axios.get(`${API_ROOT}/profile/tokens`)
    .then(response => response.data),
});

interface Props {
  tokens: PromiseLoaderResponse<Linode.ManyResourceState<Linode.Token>>;
}

interface State {
}
type CombinedProps = Props & WithStyles<ClassNames>;

class APITokens extends React.Component<CombinedProps, State> {
  render() {
    const { classes } = this.props;
    const tokens = pathOr([], ['response', 'data'], this.props.tokens);

    return (
      <React.Fragment>
        <Typography variant="headline" className={classes.headline}>
          Personal Access Tokens
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tokens.map((token: Linode.Token) =>
              <TableRow key={token.id}>
                <TableCell>
                  <Typography variant="subheading">
                    {token.label}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subheading">
                    {token.type}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subheading">
                    {token.created}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subheading">
                    {token.expiry}
                  </Typography>
                </TableCell>
              </TableRow>,
            )}
          </TableBody>
        </Table>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true })<Props>(APITokens);

export default preloaded(styled);
