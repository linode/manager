import { Domain } from 'linode-js-sdk/lib/domains';
import { APIError } from 'linode-js-sdk/lib/types';
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
  openForEditing,
  Origin as DomainDrawerOrigin
} from 'src/store/domainDrawer';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { sendGroupByTagEnabledEvent } from 'src/utilities/ga';
import DisableDomainDialog from './DisableDomainDialog';
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
  importDrawerOpen: boolean;
  importDrawerSubmitting: false;
  importDrawerErrors?: APIError[];
  remote_nameserver: string;
  createDrawerOpen: boolean;
  createDrawerMode: 'clone' | 'create';
  selectedDomainLabel: string;
  selectedDomainID?: number;
  removeDialogOpen: boolean;
  disableDialogOpen: boolean;
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
    importDrawerOpen: false,
    importDrawerSubmitting: false,
    remote_nameserver: '',
    createDrawerMode: 'create',
    createDrawerOpen: false,
    removeDialogOpen: false,
    selectedDomainLabel: '',
    disableDialogOpen: false
  };

  static docs: Linode.Doc[] = [Domains];

  cancelRequest: Function;

  openImportZoneDrawer = () => this.setState({ importDrawerOpen: true });

  closeImportZoneDrawer = () =>
    this.setState({
      importDrawerOpen: false,
      importDrawerSubmitting: false,
      remote_nameserver: '',
      selectedDomainLabel: '',
      importDrawerErrors: undefined
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
    const { selectedDomainID } = this.state;
    const { enqueueSnackbar, deleteDomain } = this.props;
    if (selectedDomainID) {
      deleteDomain({ domainId: selectedDomainID })
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

  handleClickEnableOrDisableDomain = (
    action: 'enable' | 'disable',
    domain: string,
    domainId: number
  ) => {
    if (action === 'enable') {
      return this.props
        .updateDomain({
          domainId,
          status: 'active'
        })
        .catch(e => {
          return this.props.enqueueSnackbar(
            getAPIErrorOrDefault(
              e,
              'There was an issue enabling your domain'
            )[0].reason,
            {
              variant: 'error'
            }
          );
        });
    } else {
      return this.setState({
        disableDialogOpen: true,
        selectedDomainID: domainId,
        selectedDomainLabel: domain
      });
    }
  };

  openRemoveDialog = (domain: string, domainId: number) => {
    this.setState({
      removeDialogOpen: true,
      selectedDomainLabel: domain,
      selectedDomainID: domainId
    });
  };

  closeRemoveDialog = () => {
    this.setState({
      removeDialogOpen: false
    });
  };

  render() {
    const { classes } = this.props;
    const {
      domainsError,
      domainsData,
      domainsLoading,
      howManyLinodesOnAccount,
      isRestrictedUser,
      linodesLoading
    } = this.props;

    if (domainsLoading) {
      return <RenderLoading />;
    }

    if (domainsError.read) {
      return <RenderError />;
    }

    if (!domainsData || domainsData.length === 0) {
      return (
        <RenderEmpty
          onClick={this.props.openForCreating('Created from Domain Landing')}
        />
      );
    }

    /**
     * Users with no Linodes on their account should see a banner
     * warning them that their DNS records are not being served.
     *
     * Restricted users can often not view the number of Linodes
     * on the account, so to prevent the possibility of displaying inaccurate
     * warnings, we don't show the banner to restricted users.
     *
     * We also hide the banner while Linodes data are still loading, since count
     * will be 0 until loading is complete.
     */
    const shouldShowBanner =
      !isRestrictedUser &&
      !linodesLoading &&
      howManyLinodesOnAccount === 0 &&
      domainsData.length > 0;

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
                          onClick={this.props.openForCreating(
                            'Created from Domain Landing'
                          )}
                          label="Add a Domain"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                {shouldShowBanner && (
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
                        onRemove: this.openRemoveDialog,
                        onDisableOrEnable: this.handleClickEnableOrDisableDomain
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
          open={this.state.importDrawerOpen}
          onClose={this.closeImportZoneDrawer}
          onSuccess={this.handleSuccess}
        />
        <DisableDomainDialog
          updateDomain={this.props.updateDomain}
          selectedDomainID={this.state.selectedDomainID}
          selectedDomainLabel={this.state.selectedDomainLabel}
          closeDialog={() => this.setState({ disableDialogOpen: false })}
          open={this.state.disableDialogOpen}
        />
        <ConfirmationDialog
          open={this.state.removeDialogOpen}
          title={`Remove ${this.state.selectedDomainLabel}`}
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
        rel="noopener noreferrer"
        className="h-u"
      >
        Find out how to setup your domains associated with your Linodes
      </a>
      &nbsp;or&nbsp;
      <a
        href="https://www.linode.com/docs/"
        target="_blank"
        rel="noopener noreferrer"
        className="h-u"
      >
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
        buttonProps={[
          {
            onClick: props.onClick,
            children: 'Add a Domain'
          }
        ]}
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
  openForCreating: (origin: DomainDrawerOrigin) => void;
}

interface StateProps {
  howManyLinodesOnAccount: number;
  linodesLoading: boolean;
  isRestrictedUser: boolean;
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
  linodesLoading: pathOr(false, ['linodes', 'loading'], state.__resources),
  isRestrictedUser: pathOr(
    true,
    ['__resources', 'profile', 'data', 'restricted'],
    state
  )
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
