import { Domain } from 'linode-js-sdk/lib/domains';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import DomainIcon from 'src/assets/addnewmenu/domain.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import FormControlLabel from 'src/components/core/FormControlLabel';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Placeholder from 'src/components/Placeholder';
import Toggle from 'src/components/Toggle';
import domainsContainer, {
  Props as DomainProps,
  StateProps as DomainStateProps
} from 'src/containers/domains.container';
import { Domains } from 'src/documentation';
import ListDomains from 'src/features/Domains/ListDomains';
import ListGroupedDomains from 'src/features/Domains/ListGroupedDomains';
import {
  openForCloning,
  openForCreating,
  openForEditing
} from 'src/store/domainDrawer';
import { sendGroupByTagEnabledEvent } from 'src/utilities/ga';
import DomainZoneImportDrawer from './DomainZoneImportDrawer';

import Notice from 'src/components/Notice';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import { ApplicationState } from 'src/store';

type ClassNames =
  | 'root'
  | 'titleWrapper'
  | 'title'
  | 'breadcrumbs'
  | 'domain'
  | 'dnsWarning'
  | 'tagWrapper'
  | 'tagGroup';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    titleWrapper: {
      flex: 1
    },
    title: {
      marginBottom: theme.spacing(1) + theme.spacing(1) / 2
    },
    breadcrumbs: {
      marginBottom: theme.spacing(1)
    },
    domain: {
      width: '60%'
    },
    dnsWarning: {
      '& h3:first-child': {
        marginBottom: theme.spacing(1)
      }
    },
    tagWrapper: {
      marginTop: theme.spacing(1) / 2,
      '& [class*="MuiChip"]': {
        cursor: 'pointer'
      }
    },
    tagGroup: {
      flexDirection: 'row-reverse',
      marginBottom: theme.spacing(2) - 8
    }
  });

interface State {
  importDrawer: {
    open: boolean;
    submitting: boolean;
    errors?: Linode.ApiFieldError[];
    domain?: string;
    remote_nameserver?: string;
  };
  createDrawer: {
    open: boolean;
    mode: 'clone' | 'create';
    domain?: string;
    id?: number;
  };
  removeDialog: {
    open: boolean;
    domain?: string;
    domainId?: number;
  };
}

interface Props {
  /** purely so we can force a preference to get the unit tests to pass */
  shouldGroupDomains?: boolean;
}

export type CombinedProps = DomainProps &
  WithStyles<ClassNames> &
  Props &
  RouteComponentProps<{}> &
  StateProps &
  DispatchProps &
  WithSnackbarProps;

export class DomainsLanding extends React.Component<CombinedProps, State> {
  state: State = {
    importDrawer: {
      open: false,
      submitting: false
    },
    createDrawer: {
      open: false,
      mode: 'create'
    },
    removeDialog: {
      open: false
    }
  };

  static docs: Linode.Doc[] = [Domains];

  cancelRequest: Function;

  openImportZoneDrawer = () =>
    this.setState({ importDrawer: { ...this.state.importDrawer, open: true } });

  closeImportZoneDrawer = () =>
    this.setState({
      importDrawer: {
        open: false,
        submitting: false,
        remote_nameserver: undefined,
        domain: undefined,
        errors: undefined
      }
    });

  handleSuccess = (domain: Domain) => {
    if (domain.id) {
      return this.props.history.push(`/domains/${domain.id}`);
    }
  };

  getActions = () => {
    return (
      <ActionsPanel>
        <Button
          buttonType="cancel"
          onClick={this.closeRemoveDialog}
          data-qa-cancel
        >
          Cancel
        </Button>
        <Button
          buttonType="secondary"
          destructive
          onClick={this.removeDomain}
          data-qa-submit
        >
          Confirm
        </Button>
      </ActionsPanel>
    );
  };

  removeDomain = () => {
    const {
      removeDialog: { domainId }
    } = this.state;
    const { enqueueSnackbar, deleteDomain } = this.props;
    if (domainId) {
      deleteDomain({ domainId })
        .then(() => {
          this.closeRemoveDialog();
        })
        .catch(() => {
          this.closeRemoveDialog();
          /** @todo render this error inside the modal */
          enqueueSnackbar('Error when removing domain', {
            variant: 'error'
          });
        });
    } else {
      this.closeRemoveDialog();
      enqueueSnackbar('Error when removing domain', {
        variant: 'error'
      });
    }
  };

  openRemoveDialog = (domain: string, domainId: number) => {
    this.setState({
      removeDialog: { open: true, domain, domainId }
    });
  };

  closeRemoveDialog = () => {
    const { removeDialog } = this.state;
    this.setState({
      removeDialog: { ...removeDialog, open: false }
    });
  };

  render() {
    const { classes } = this.props;
    const { domainsError, domainsData, domainsLoading } = this.props;

    if (domainsLoading) {
      return <RenderLoading />;
    }

    if (domainsError.read) {
      return <RenderError />;
    }

    if (!domainsData || domainsData.length === 0) {
      return <RenderEmpty onClick={this.props.openForCreating} />;
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Domains" />
        <PreferenceToggle<boolean>
          preferenceKey="domains_group_by_tag"
          preferenceOptions={[false, true]}
          localStorageKey="GROUP_DOMAINS"
          toggleCallbackFnDebounced={toggleDomainsGroupBy}
          /** again, this value prop should be undefined - purely for the unit test's sake */
          value={this.props.shouldGroupDomains}
        >
          {({
            preference: domainsAreGrouped,
            togglePreference: toggleGroupDomains
          }: ToggleProps<boolean>) => {
            return (
              <React.Fragment>
                <Grid
                  container
                  justify="space-between"
                  alignItems="flex-end"
                  style={{ paddingBottom: 0 }}
                >
                  <Grid item className={classes.titleWrapper}>
                    <Breadcrumb
                      pathname={this.props.location.pathname}
                      labelTitle="Domains"
                      className={classes.breadcrumbs}
                    />
                  </Grid>
                  <Grid item className="p0">
                    <FormControlLabel
                      className={classes.tagGroup}
                      control={
                        <Toggle
                          className={
                            domainsAreGrouped ? ' checked' : ' unchecked'
                          }
                          onChange={toggleGroupDomains}
                          checked={domainsAreGrouped}
                        />
                      }
                      label="Group by Tag:"
                    />
                  </Grid>
                  <Grid item>
                    <Grid
                      container
                      alignItems="flex-end"
                      style={{ width: 'auto' }}
                    >
                      <Grid item className="pt0">
                        <AddNewLink
                          onClick={this.openImportZoneDrawer}
                          label="Import a Zone"
                        />
                      </Grid>
                      <Grid item className="pt0">
                        <AddNewLink
                          onClick={this.props.openForCreating}
                          label="Add a Domain"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                {!this.props.linodesLoading &&
                  this.props.howManyLinodesOnAccount === 0 &&
                  domainsData.length > 0 && (
                    <Notice warning important className={classes.dnsWarning}>
                      <Typography variant="h3">
                        Your DNS zones are not being served.
                      </Typography>
                      <Typography>
                        Your domains will not be served by Linode's nameservers
                        unless you have at least one active Linode on your
                        account.
                        <Link to="/linodes/create">
                          {' '}
                          You can create one here.
                        </Link>
                      </Typography>
                    </Notice>
                  )}
                {this.props.location.state &&
                  this.props.location.state.recordError && (
                    <Notice
                      error
                      text={this.props.location.state.recordError}
                    />
                  )}
                <Grid item xs={12}>
                  {/* Duplication starts here. How can we refactor this? */}
                  <OrderBy data={domainsData} order={'asc'} orderBy={'domain'}>
                    {({
                      data: orderedData,
                      handleOrderChange,
                      order,
                      orderBy
                    }) => {
                      const props = {
                        orderBy,
                        order,
                        handleOrderChange,
                        data: orderedData,
                        onClone: this.props.openForCloning,
                        onEdit: this.props.openForEditing,
                        onRemove: this.openRemoveDialog
                      };

                      return domainsAreGrouped ? (
                        <ListGroupedDomains {...props} />
                      ) : (
                        <ListDomains {...props} />
                      );
                    }}
                  </OrderBy>
                </Grid>
              </React.Fragment>
            );
          }}
        </PreferenceToggle>
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
}

const RenderLoading: React.StatelessComponent<{}> = () => {
  return <CircleProgress />;
};

const RenderError: React.StatelessComponent<{}> = () => {
  return (
    <ErrorState errorText="There was an error retrieving your domains. Please reload and try again." />
  );
};

const EmptyCopy = () => (
  <>
    <Typography variant="subtitle1">
      Create a Domain, add Domain records, import zones and domains.
    </Typography>
    <Typography variant="subtitle1">
      <a
        href="https://www.linode.com/docs/platform/manager/dns-manager-new-manager/"
        target="_blank"
        className="h-u"
      >
        Find out how to setup your domains associated with your Linodes
      </a>
      &nbsp;or&nbsp;
      <a href="https://www.linode.com/docs/" target="_blank" className="h-u">
        visit our guides and tutorials.
      </a>
    </Typography>
  </>
);

const RenderEmpty: React.StatelessComponent<{
  onClick: () => void;
}> = props => {
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Domains" />
      <Placeholder
        title="Manage your Domains"
        copy={<EmptyCopy />}
        icon={DomainIcon}
        buttonProps={{
          onClick: props.onClick,
          children: 'Add a Domain'
        }}
      />
    </React.Fragment>
  );
};

const eventCategory = `domains landing`;

const toggleDomainsGroupBy = (checked: boolean) =>
  sendGroupByTagEnabledEvent(eventCategory, checked);

const styled = withStyles(styles);

interface DispatchProps {
  openForCloning: (domain: string, id: number) => void;
  openForEditing: (domain: string, id: number) => void;
  openForCreating: () => void;
}

interface StateProps {
  howManyLinodesOnAccount: number;
  linodesLoading: boolean;
}

const mapStateToProps: MapStateToProps<
  StateProps,
  {},
  ApplicationState
> = state => ({
  howManyLinodesOnAccount: pathOr(
    [],
    ['__resources', 'linodes', 'results'],
    state
  ).length,
  linodesLoading: pathOr(false, ['linodes', 'loading'], state.__resources)
});

export const connected = connect(
  mapStateToProps,
  { openForCreating, openForCloning, openForEditing }
);

export default compose<CombinedProps, Props>(
  setDocs(DomainsLanding.docs),
  domainsContainer<DomainStateProps, {}>(
    (ownProps, domainsLoading, domainsError, domains) => ({
      domainsData: domains,
      domainsError,
      domainsLoading
    })
  ),
  withRouter,
  connected,
  withSnackbar,
  styled
)(DomainsLanding);
