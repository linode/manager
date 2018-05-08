import * as React from 'react';
import { compose, pathOr } from 'ramda';
import { Link } from 'react-router-dom';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Paper from 'material-ui/Paper';
import Table from 'material-ui/Table';
import TableBody from 'material-ui/Table/TableBody';
import TableCell from 'material-ui/Table/TableCell';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';
import Placeholder from 'src/components/Placeholder';

import { getDomains } from 'src/services/domains';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import ErrorState from 'src/components/ErrorState';

import ActionMenu from './DomainActionMenu';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props { }

interface PromiseLoaderProps {
  domains: PromiseLoaderResponse<Linode.Domain>;
}

interface State {
  domains: Linode.Domain[];
  error?: Error;
}

type CombinedProps = Props & PromiseLoaderProps & WithStyles<ClassNames>;

class DomainsLanding extends React.Component<CombinedProps, State> {
  state: State = {
    domains: pathOr([], ['response', 'data'], this.props.domains),
    error: pathOr(undefined, ['error'], this.props.domains),
  };

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  render() {
    const { error, domains } = this.state;

    /** Error State */
    if (error) {
      return <ErrorState
        errorText="There was an error retrieving your domains. Please reload and try again."
      />;
    }

    /** Empty State */
    if (domains.length === 0) {
      return <Placeholder
        title="Add a Domain"
        copy="Adding a new domain is easy. Click below to add a domain."
        buttonProps={{
          onClick: () => null,
          children: 'Add a Domain',
        }}
      />;
    }

    return (
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Domain</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              domains.map((domain) => {
                return (
                  <TableRow key={domain.id}>
                    <TableCell><Link to={`/domains/${domain.id}`}>{domain.domain}</Link></TableCell>
                    <TableCell>{domain.type}</TableCell>
                    <TableCell>{domain.status}</TableCell>
                    <TableCell><ActionMenu /></TableCell>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>
      </Paper>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const loaded = PromiseLoader<Props>({
  domains: props => getDomains(),
});

export default compose(
  loaded,
  styled,
)(DomainsLanding);
