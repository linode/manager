import * as React from 'react';
import { compose, pathOr } from 'ramda';
import {
  Link,
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Table from 'material-ui/Table';
import TableBody from 'material-ui/Table/TableBody';
import TableCell from 'material-ui/Table/TableCell';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';
import Typography from 'material-ui/Typography';
import Placeholder from 'src/components/Placeholder';

import ActionsPanel from 'src/components/ActionsPanel';
import { getDomains, deleteDomain } from 'src/services/domains';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import Grid from 'src/components/Grid';
import ErrorState from 'src/components/ErrorState';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

import ActionMenu from './DomainActionMenu';
import DomainCreateDrawer from './DomainCreateDrawer';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props { }

interface PromiseLoaderProps {
  domains: PromiseLoaderResponse<Linode.Domain>;
}

interface State {
  domains: Linode.Domain[];
  error?: Error;
  createDrawer: {
    open: boolean,
  };
  removeDialog: {
    open: boolean,
    domain?: string,
    domainID?: number,
  };
}

type CombinedProps = Props & PromiseLoaderProps & WithStyles<ClassNames> & RouteComponentProps<{}>;

class DomainsLanding extends React.Component<CombinedProps, State> {
  state: State = {
    domains: pathOr([], ['response', 'data'], this.props.domains),
    error: pathOr(undefined, ['error'], this.props.domains),
    createDrawer: {
      open: false,
    },
    removeDialog: {
      open: false,
    },
  };

  refreshDomains() {
    getDomains()
      .then((response) => {
        this.setState({ domains: response.data });
      });
  }

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  openCreateDrawer() {
    this.setState({
      createDrawer: { open: true },
    });
    this.refreshDomains();
  }

  closeCreateDrawer(domain?: Partial<Linode.Domain>) {
    this.setState({
      createDrawer: { open: false },
      domains: [...this.state.domains, domain as Linode.Domain],
    });
  }

  removeDomain = () => {
    const { removeDialog: { domainID } } = this.state;
    if (domainID) {
      deleteDomain(domainID)
        .then(() => {
          this.closeRemoveDialog();
          this.refreshDomains();
        })
        .catch(() => {
          this.closeRemoveDialog();
          sendToast('Error when removing domain', 'error');
        });
    } else {
      this.closeRemoveDialog();
      sendToast('Error when removing domain', 'error');
    }
  }

  openRemoveDialog(domain: string, domainID: number) {
    this.setState({
      removeDialog: { open: true, domain, domainID },
    });
  }

  closeRemoveDialog() {
    this.setState({
      removeDialog: { open: false, domain: undefined, domainID: undefined },
    });
  }

  render() {
    const { classes, history } = this.props;
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
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }} >
          <Grid item>
            <Typography variant="headline" data-qa-title className={classes.title}>
              Domains
            </Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end">
              <Grid item>
                <Button
                  onClick={() => this.openCreateDrawer()}
                  title="Add a Domain"
                >
                  Add new Domain
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={() => this.openCreateDrawer()}
                  title="Clone an Existing Zone"
                >
                  Clone an Existing Zone
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
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
              {domains.map(domain =>
                <TableRow key={domain.id}>
                  <TableCell><Link to={`/domains/${domain.id}`}>{domain.domain}</Link></TableCell>
                  <TableCell>{domain.type}</TableCell>
                  <TableCell>{domain.status}</TableCell>
                  <TableCell>
                    <ActionMenu
                      onEditRecords={() => {
                        history.push(`/domains/${domain.id}`);
                      }}
                      onRemove={() => {
                        this.openRemoveDialog(domain.domain, domain.id);
                      }}
                    />
                  </TableCell>
                </TableRow>,
              )}
            </TableBody>
          </Table>
        </Paper>
        <DomainCreateDrawer
          open={this.state.createDrawer.open}
          onClose={(domain: Partial<Linode.Domain>) => this.closeCreateDrawer(domain)}
        />
        <ConfirmationDialog
          open={this.state.removeDialog.open}
          title={`Remove ${this.state.removeDialog.domain}`}
          onClose={this.closeRemoveDialog}
          actions={() =>
            <ActionsPanel>
              <Button
                variant="raised"
                color="secondary"
                className="destructive"
                onClick={this.removeDomain}
              >
                Confirm
              </Button>
              <Button
                onClick={this.closeRemoveDialog}
                variant="raised"
                color="secondary"
                className="cancel"
              >
                Cancel
              </Button>
            </ActionsPanel>
          }
        >
          <Typography>Are you sure you want to remove this domain?</Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const loaded = PromiseLoader<Props>({
  domains: props => getDomains(),
});

export default compose(
  withRouter,
  loaded,
  styled,
)(DomainsLanding);
