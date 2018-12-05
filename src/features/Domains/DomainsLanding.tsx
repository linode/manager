import { InjectedNotistackProps, withSnackbar } from 'notistack';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, WithStyles, withStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Placeholder from 'src/components/Placeholder';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import Tags from 'src/components/Tags';
import { Domains } from 'src/documentation';
import { deleteDomain, getDomains } from 'src/services/domains';
import { openForCloning, openForCreating } from 'src/store/reducers/domainDrawer';
import ActionMenu from './DomainActionMenu';
import DomainZoneImportDrawer from './DomainZoneImportDrawer';

type ClassNames = 'root'
  | 'title'
  | 'domain'
  | 'tagWrapper'
  | 'domainRow';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  domain: {
    width: '60%',
  },
  domainRow: {
    height: 75,
  },
  tagWrapper: {
    marginTop: theme.spacing.unit / 2,
    '& [class*="MuiChip"]': {
      cursor: 'pointer',
    },
  },
});

interface State {
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

type CombinedProps = PaginationProps<Linode.Domain>
  & WithStyles<ClassNames>
  & RouteComponentProps<{}>
  & DispatchProps
  & InjectedNotistackProps;

class DomainsLanding extends React.Component<CombinedProps, State> {
  state: State = {
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

  static docs: Linode.Doc[] = [
    Domains,
  ];

  cancelRequest: Function;

  componentDidMount() {
    this.props.request();
  }

  componentWillUnmount() {
    if (typeof this.cancelRequest === 'function') {
      this.cancelRequest();
    }
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

  handleSuccess = (domain: Linode.Domain) => {
    if (domain.id) {
      return this.props.history.push(`/domains/${domain.id}`);
    }
    this.props.request();
  }

  getActions = () => {
    return (
      <ActionsPanel>
        <Button type="cancel" onClick={this.closeRemoveDialog} data-qa-cancel>Cancel</Button>
        <Button type="secondary" destructive onClick={this.removeDomain} data-qa-submit>Confirm</Button>
      </ActionsPanel>
    )
  }

  removeDomain = () => {
    const { removeDialog: { domainID } } = this.state;
    const { enqueueSnackbar } = this.props;
    if (domainID) {
      deleteDomain(domainID)
        .then(() => {
          this.closeRemoveDialog();
          this.props.onDelete();
        })
        .catch(() => {
          this.closeRemoveDialog();
          /** @todo render this error inside the modal */
          enqueueSnackbar('Error when removing domain', {
            variant: 'error'
          })
        });
    } else {
      this.closeRemoveDialog();
      enqueueSnackbar('Error when removing domain', {
        variant: 'error'
      })
    }
  }

  openRemoveDialog = (domain: string, domainID: number) => {
    this.setState({
      removeDialog: { open: true, domain, domainID },
    });
  }

  closeRemoveDialog = () => {
    const { removeDialog } = this.state;
    this.setState({
      removeDialog: { ...removeDialog, open: false },
    });
  }

  render() {
    const { classes } = this.props;
    const { error, count, loading } = this.props;

    if (loading) {
      return this.renderLoading();
    }

    if (error) {
      return this.renderErrors();
    }

    if (count === 0) {
      return this.renderEmpty();
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Domains" />
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }} >
          <Grid item>
            <Typography role="header" variant="h1" data-qa-title className={classes.title}>
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
                  onClick={this.props.openForCreating}
                  label="Add a Domain"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Paper>
          <Table aria-label="List of your Domains">
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
          count={this.props.count}
          page={this.props.page}
          pageSize={this.props.pageSize}
          handlePageChange={this.props.handlePageChange}
          handleSizeChange={this.props.handlePageSizeChange}
        />
        <DomainZoneImportDrawer
          open={this.state.importDrawer.open}
          onClose={this.closeImportZoneDrawer}
          onSuccess={this.handleSuccess}
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
    const { error, count, data: domains } = this.props;

    if (error) {
      return this.renderErrors();
    }

    if (count > 0) {
      return this.renderData(domains!);
    }

    return null;
  };

  renderLoading = () => {
    return (
      <CircleProgress />
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
        <DocumentTitleSegment segment="Domains" />
        <Placeholder
          title="Add a Domain"
          copy="Adding a new domain is easy. Click below to add a domain."
          icon={DomainIcon}
          buttonProps={{
            onClick: this.props.openForCreating,
            children: 'Add a Domain',
          }}
        />
      </React.Fragment>
    );
  }

  renderData = (domains: Linode.Domain[]) => {
    const { classes, history } = this.props;

    return (
      domains.map(domain =>
        <TableRow
          key={domain.id}
          data-qa-domain-cell={domain.id}
          className={`${classes.domainRow} ${'fade-in-table'}`}
          rowLink={`/domains/${domain.id}`}
        >
          <TableCell parentColumn="Domain" data-qa-domain-label>
            <Link to={`/domains/${domain.id}`}>
              {domain.domain}
              <div className={classes.tagWrapper}>
                <Tags tags={domain.tags} />
              </div>
            </Link>
          </TableCell>
          <TableCell parentColumn="Type" data-qa-domain-type>{domain.type}</TableCell>
          <TableCell>
            <ActionMenu
              domain={domain.domain}
              id={domain.id}
              history={history}
              onRemove={this.openRemoveDialog}
              onClone={this.props.openForCloning}
            />
          </TableCell>
        </TableRow>,
      )
    );
  }
}

const updatedRequest = (ownProps: any, params: any, filters: any) => getDomains(params, filters)
  .then(response => response);

const paginated = Pagey(updatedRequest);

const styled = withStyles(styles);

interface DispatchProps {
  openForCloning: (domain: string, cloneId: number) => void;
  openForCreating: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  { openForCreating, openForCloning },
  dispatch,
);

export const connected = connect(undefined, mapDispatchToProps);

export default compose<CombinedProps, {}>(
  setDocs(DomainsLanding.docs),
  withRouter,
  styled,
  paginated,
  connected,
  withSnackbar
)(DomainsLanding);
