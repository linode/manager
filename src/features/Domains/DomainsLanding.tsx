import * as React from 'react';
import { compose, pathOr } from 'ramda';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import TableBody from 'material-ui/Table/TableBody';
import TableCell from 'material-ui/Table/TableCell';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';
import Typography from 'material-ui/Typography';

import { getDomains, deleteDomain } from 'src/services/domains';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import PlusSquare from 'src/assets/icons/plus-square.svg';
import Placeholder from 'src/components/Placeholder';
import Table from 'src/components/Table';
import Grid from 'src/components/Grid';
import ErrorState from 'src/components/ErrorState';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import ActionsPanel from 'src/components/ActionsPanel';
import IconTextLink from 'src/components/IconTextLink';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import setDocs from 'src/components/DocsSidebar/setDocs';

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
    mode: 'clone' | 'create',
    domain?: string,
    cloneID?: number,
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
      mode: 'create',
    },
    removeDialog: {
      open: false,
    },
  };

  static docs: Linode.Doc[] = [
    {
      title: 'Getting Started',
      src: 'https://www.linode.com/docs/networking/dns/dns-manager-overview/#getting-started',
      body: `The Domain Name System (DNS) attaches human-readable domain names to machine-usable IP
      addresses. In many ways, it is the phone book of the Internet. Just like a phone book can
      help you find the phone number of a business, DNS can take a domain name like google.com and
      translate it into an IP address like 74.125.19.147, the IP address for Google’s homepage.
      This global system allows users to remember the names of websites instead of their numeric
      IP addresses.`,
    },
  ];

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
      createDrawer: { open: true, mode: 'create' },
    });
  }

  openCloneDrawer(domain: string, id: number) {
    this.setState({
      createDrawer: { open: true, mode: 'clone', domain, cloneID: id },
    });
  }

  closeCreateDrawer(domain?: Partial<Linode.Domain>) {
    this.setState({
      createDrawer: { open: false, mode: 'create' },
    });
    if (domain) {
      this.setState({
        domains: [...this.state.domains, domain as Linode.Domain],
      });
    }
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

  DomainCreateDrawer = () => (
    <DomainCreateDrawer
      open={this.state.createDrawer.open}
      onClose={(domain: Partial<Linode.Domain>) => this.closeCreateDrawer(domain)}
      mode={this.state.createDrawer.mode}
      domain={this.state.createDrawer.domain}
      cloneID={this.state.createDrawer.cloneID}
    />
  )

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
      return (
        <React.Fragment>
          <Placeholder
            title="Add a Domain"
            copy="Adding a new domain is easy. Click below to add a domain."
            buttonProps={{
              onClick: () => this.openCreateDrawer(),
              children: 'Add a Domain',
            }}
          />
          <this.DomainCreateDrawer />
        </React.Fragment>
      );
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
                <IconTextLink
                  SideIcon={PlusSquare}
                  onClick={() => this.openCreateDrawer()}
                  title="Add a Domain"
                  text="Add a Domain"
                >
                  Add new Domain
                </IconTextLink>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell data-qa-domain-name-header>Domain</TableCell>
                <TableCell data-qa-domain-type-header>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {domains.map(domain =>
                <TableRow key={domain.id} data-qa-domain-cell={domain.id}>
                  <TableCell data-qa-domain-label>
                    <Link to={`/domains/${domain.id}`}>
                      {domain.domain}
                    </Link>
                  </TableCell>
                  <TableCell data-qa-domain-type>{domain.type}</TableCell>
                  <TableCell>{domain.status}</TableCell>
                  <TableCell>
                    <ActionMenu
                      onEditRecords={() => {
                        history.push(`/domains/${domain.id}`);
                      }}
                      onRemove={() => {
                        this.openRemoveDialog(domain.domain, domain.id);
                      }}
                      onClone={() => {
                        this.openCloneDrawer(domain.domain, domain.id);
                      }}
                    />
                  </TableCell>
                </TableRow>,
              )}
            </TableBody>
          </Table>
        </Paper>
        <this.DomainCreateDrawer />
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
                data-qa-submit
              >
                Confirm
              </Button>
              <Button
                onClick={this.closeRemoveDialog}
                variant="raised"
                color="secondary"
                className="cancel"
                data-qa-cancel
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
  setDocs(DomainsLanding.docs),
  withRouter,
  loaded,
  styled,
)(DomainsLanding);
