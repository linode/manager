import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import setDocs from 'src/components/DocsSidebar/setDocs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import PaginationFooter, { PaginationProps } from 'src/components/PaginationFooter';
import Placeholder from 'src/components/Placeholder';
import Table from 'src/components/Table';
import TableRowLoading from 'src/components/TableRowLoading';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import { deleteDomain, getDomains } from 'src/services/domains';
import scrollToTop from 'src/utilities/scrollToTop';

import ActionMenu from './DomainActionMenu';
import DomainCreateDrawer from './DomainCreateDrawer';
import DomainZoneImportDrawer from './DomainZoneImportDrawer';

type ClassNames = 'root' | 'title' | 'domain';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  domain: {
    width: '60%',
  },
});

interface Props { }

interface State extends PaginationProps {
  domains: Linode.Domain[];
  loading: boolean;
  errors?: Error;
  importDrawer: {
    open: boolean,
    submitting: boolean,
    errors?: Linode.ApiFieldError[];
    domain?: string;
    remote_nameserver?: string;
  },
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

type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{}>;

class DomainsLanding extends React.Component<CombinedProps, State> {
  state: State = {
    domains: [],
    page: 1,
    count: 0,
    pageSize: 25,
    loading: true,
    importDrawer: {
      open: false,
      submitting: false,
    },
    createDrawer: {
      open: false,
      mode: 'create',
    },
    removeDialog: {
      open: false,
    },
  };

  mounted: boolean = false;

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

  getDomains = (
    page: number = this.state.page,
    pageSize: number = this.state.pageSize,
    initial: boolean = false,
  ) => {
    if (!this.mounted) { return; }
    this.setState({ loading: initial });

    getDomains({ page, page_size: pageSize })
      .then((response) => {
        if (!this.mounted) { return; }

        this.setState({
          count: response.results,
          domains: response.data,
          loading: false,
          page: response.page,
        });
      })
      .catch((error) => {
        if (!this.mounted) { return; }
        this.setState({
          errors: pathOr([{ reason: 'Unable to load domains.' }], ['response', 'data', 'errors'], error),
          loading: false,
        })
      });
  }

  handlePageChange = (page: number) => {
    this.setState({ page });
    this.getDomains(page);
    scrollToTop();
  };

  handlePageSizeChange = (pageSize: number) => {
    this.setState({ pageSize });
    this.getDomains(undefined, pageSize);
  };

  componentDidMount() {
    this.mounted = true;
    this.getDomains(undefined, undefined, true);
  }

  componentWillUnmount() {
    this.mounted = false
  }

  openImportZoneDrawer = () => this.setState({ importDrawer: { ...this.state.importDrawer, open: true } });

  closeImportZoneDrawer = () => this.setState({
    importDrawer: {
      open: false,
      submitting: false,
      remote_nameserver: undefined,
      domain: undefined,
      errors: undefined,
    }
  });

  openCreateDrawer = () => {
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

  getActions = () => {
    return (
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
    )
  }

  removeDomain = () => {
    const { removeDialog: { domainID } } = this.state;
    if (domainID) {
      deleteDomain(domainID)
        .then(() => {
          this.closeRemoveDialog();
          this.getDomains();
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

  openRemoveDialog = (domain: string, domainID: number) => {
    this.setState({
      removeDialog: { open: true, domain, domainID },
    });
  }

  closeRemoveDialog = () => {
    this.setState({
      removeDialog: { open: false, domain: undefined, domainID: undefined },
    });
  }

  domainCreateDrawer = () => {
    return (
      <DomainCreateDrawer
        open={this.state.createDrawer.open}
        onClose={(domain: Partial<Linode.Domain>) => this.closeCreateDrawer(domain)}
        mode={this.state.createDrawer.mode}
        domain={this.state.createDrawer.domain}
        cloneID={this.state.createDrawer.cloneID}
      />
    );
  }

  render() {
    const { classes } = this.props;
    const { count, loading } = this.state;

    if (!loading && count === 0) {
      return this.renderEmpty();
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
            <Grid container alignItems="flex-end" style={{ width: 'auto' }}>
              <Grid item>
                <AddNewLink
                  onClick={this.openImportZoneDrawer}
                  label="Import a Zone"
                />
              </Grid>
              <Grid item>
                <AddNewLink
                  onClick={this.openCreateDrawer}
                  label="Add a Domain"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell data-qa-domain-name-header className={classes.domain}>Domain</TableCell>
                <TableCell data-qa-domain-type-header>Type</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderContent()}
            </TableBody>
          </Table>
        </Paper>
        <PaginationFooter
          count={this.state.count}
          page={this.state.page}
          pageSize={this.state.pageSize}
          handlePageChange={this.handlePageChange}
          handleSizeChange={this.handlePageSizeChange}
        />
        <this.domainCreateDrawer />
        <DomainZoneImportDrawer
          open={this.state.importDrawer.open}
          onClose={this.closeImportZoneDrawer}
          onSuccess={this.getDomains}
        />
        <ConfirmationDialog
          open={this.state.removeDialog.open}
          title={`Remove ${this.state.removeDialog.domain}`}
          onClose={this.closeRemoveDialog}
          actions={this.getActions}
        >
          <Typography>Are you sure you want to remove this domain?</Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }

  renderContent = () => {
    const { loading, errors, count, domains } = this.state;

    if (loading) {
      return this.renderLoading();
    }
    if (errors) {
      return this.renderLoading();
    }

    if (count > 0) {
      return this.renderData(domains);
    }

    return null;
  };

  renderLoading = () => {
    return (
      <TableRowLoading colSpan={3} />
    );
  };

  renderErrors = () => {
    return (
      <ErrorState
        errorText="There was an error retrieving your domains. Please reload and try again."
      />
    );
  }

  renderEmpty = () => {
    return (
      <React.Fragment>
        <Placeholder
          title="Add a Domain"
          copy="Adding a new domain is easy. Click below to add a domain."
          icon={DomainIcon}
          buttonProps={{
            onClick: () => this.openCreateDrawer(),
            children: 'Add a Domain',
          }}
        />
        <this.domainCreateDrawer />
      </React.Fragment>
    );
  }

  renderData = (domains: Linode.Domain[]) => {
    const { classes, history } = this.props;

    return (
      domains.map(domain =>
        <TableRow key={domain.id} data-qa-domain-cell={domain.id}>
          <TableCell className={classes.domain} data-qa-domain-label>
            <Link to={`/domains/${domain.id}`}>
              {domain.domain}
            </Link>
          </TableCell>
          <TableCell data-qa-domain-type>{domain.type}</TableCell>
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
      )
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  setDocs(DomainsLanding.docs),
  withRouter,
  styled,
)(DomainsLanding);
