import { Domain, getDomains } from '@linode/api-v4/lib/domains';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import DomainIcon from 'src/assets/icons/entityIcons/domain.svg';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import {
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DeletionDialog from 'src/components/DeletionDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { EntityTableRow, HeaderCell } from 'src/components/EntityTable';
import EntityTable from 'src/components/EntityTable/EntityTable_CMR';
import ErrorState from 'src/components/ErrorState';
import LandingHeader from 'src/components/LandingHeader';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { Order } from 'src/components/Pagey';
import Placeholder from 'src/components/Placeholder';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import domainsContainer, {
  Props as DomainProps,
} from 'src/containers/domains.container';
import { ApplicationState } from 'src/store';
import {
  openForCloning,
  openForCreating,
  openForEditing as _openForEditing,
  Origin as DomainDrawerOrigin,
} from 'src/store/domainDrawer';
import { upsertMultipleDomains } from 'src/store/domains/domains.actions';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { sendGroupByTagEnabledEvent } from 'src/utilities/ga';
import DisableDomainDialog from './DisableDomainDialog';
import { Handlers as DomainHandlers } from './DomainActionMenu';
import DomainBanner from './DomainBanner';
import DomainRow from './DomainTableRow';
import DomainZoneImportDrawer from './DomainZoneImportDrawer';

const DOMAIN_CREATE_ROUTE = '/domains/create';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    // Adds spacing when the docs button wraps to make it look a little less awkward
    [theme.breakpoints.down(380)]: {
      '& .docsButton': {
        paddingBottom: theme.spacing(2),
      },
    },
  },
  importButton: {
    marginLeft: -theme.spacing(),
    whiteSpace: 'nowrap',
  },
}));

interface Props {
  // Purely so we can force a preference to get the unit tests to pass
  shouldGroupDomains?: boolean;
  // Since secondary Domains do not have a Detail page, we allow the consumer to
  // render this component with the "Edit Domain" drawer already opened.
  domainForEditing?: {
    domainId: number;
    domainLabel: string;
  };
}

const initialOrder = { order: 'asc' as Order, orderBy: 'domain' };

export type CombinedProps = DispatchProps &
  DomainProps &
  Props &
  RouteComponentProps<{}> &
  StateProps &
  WithSnackbarProps;

const getHeaders = (
  matchesXsDown: boolean,
  matchesSmDown: boolean,
  matchesMdDown: boolean
): HeaderCell[] =>
  [
    {
      label: 'Domain',
      dataColumn: 'domain',
      sortable: true,
      widthPercent: matchesXsDown ? 50 : matchesSmDown ? 35 : 30,
    },
    {
      label: 'Status',
      dataColumn: 'status',
      sortable: true,
      widthPercent: matchesXsDown ? 25 : 12,
    },
    {
      label: 'Type',
      dataColumn: 'type',
      sortable: true,
      widthPercent: 12,
      hideOnMobile: true,
    },
    {
      label: 'Last Modified',
      dataColumn: 'updated',
      sortable: true,
      widthPercent: matchesSmDown ? 25 : matchesMdDown ? 20 : 15,
      hideOnMobile: true,
    },
  ].filter(Boolean) as HeaderCell[];

export const DomainsLanding: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const matchesXsDown = useMediaQuery(theme.breakpoints.down('xs'));
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const matchesMdDown = useMediaQuery(theme.breakpoints.down('md'));

  const {
    domainForEditing,
    domainsLastUpdated,
    isLargeAccount,
    openForEditing,
    getAllDomains,
    deleteDomain,
    domainsError,
    domainsData,
    domainsLoading,
    howManyLinodesOnAccount,
    isRestrictedUser,
    linodesLoading,
  } = props;

  const [selectedDomainLabel, setSelectedDomainLabel] = React.useState<string>(
    ''
  );
  const [selectedDomainID, setselectedDomainID] = React.useState<
    number | undefined
  >(undefined);
  const [importDrawerOpen, setImportDrawerOpen] = React.useState<boolean>(
    false
  );
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState<boolean>(
    false
  );
  const [removeDialogLoading, setRemoveDialogLoading] = React.useState<boolean>(
    false
  );
  const [removeDialogError, setRemoveDialogError] = React.useState<
    string | undefined
  >(undefined);
  const [disableDialogOpen, setDisableDialogOpen] = React.useState<boolean>(
    false
  );

  React.useEffect(() => {
    // Open the "Edit Domain" drawer if so specified by this component's props.
    if (domainForEditing) {
      const { domainId, domainLabel } = domainForEditing;
      openForEditing(domainLabel, domainId);
    }

    if (!isLargeAccount && domainsLastUpdated === 0) {
      getAllDomains();
    }
  }, [
    domainForEditing,
    domainsLastUpdated,
    getAllDomains,
    isLargeAccount,
    openForEditing,
  ]);

  React.useEffect(() => {
    // Open the "Edit Domain" drawer if so specified by this component's props.
    if (domainForEditing) {
      props.openForEditing(
        domainForEditing.domainLabel,
        domainForEditing.domainId
      );
    }
  }, [domainForEditing, props]);

  const navigateToCreate = () => {
    props.history.push(DOMAIN_CREATE_ROUTE);
  };

  const openImportZoneDrawer = () => setImportDrawerOpen(true);

  const closeImportZoneDrawer = () => {
    setSelectedDomainLabel('');
    setImportDrawerOpen(false);
  };

  const handleSuccess = (domain: Domain) => {
    props.upsertDomain(domain);

    if (domain.id) {
      return props.history.push(`/domains/${domain.id}`);
    }
  };

  const openRemoveDialog = (domain: string, domainId: number) => {
    setSelectedDomainLabel(domain);
    setselectedDomainID(domainId);
    setRemoveDialogOpen(true);
    setRemoveDialogError(undefined);
  };

  const closeRemoveDialog = () => {
    setRemoveDialogOpen(false);
  };

  const removeDomain = () => {
    setRemoveDialogLoading(true);
    setRemoveDialogError(undefined);

    if (selectedDomainID) {
      deleteDomain({ domainId: selectedDomainID })
        .then(() => {
          closeRemoveDialog();
          setRemoveDialogLoading(false);
        })
        .catch((e) => {
          setRemoveDialogLoading(false);
          setRemoveDialogError(
            getAPIErrorOrDefault(e, 'Error deleting Domain.')[0].reason
          );
        });
    } else {
      setRemoveDialogLoading(false);
      setRemoveDialogError('Error deleting Domain.');
    }
  };

  const handleClickEnableOrDisableDomain = (
    action: 'enable' | 'disable',
    domain: string,
    domainId: number
  ) => {
    if (action === 'enable') {
      props
        .updateDomain({
          domainId,
          status: 'active',
        })
        .catch((e) => {
          return props.enqueueSnackbar(
            getAPIErrorOrDefault(
              e,
              'There was an issue enabling your domain'
            )[0].reason,
            {
              variant: 'error',
            }
          );
        });
    } else {
      setSelectedDomainLabel(domain);
      setselectedDomainID(domainId);
      setDisableDialogOpen(true);
    }
  };

  const handlers: DomainHandlers = {
    onClone: props.openForCloning,
    onEdit: props.openForEditing,
    onRemove: openRemoveDialog,
    onDisableOrEnable: handleClickEnableOrDisableDomain,
  };

  const domainRow: EntityTableRow<Domain> = {
    Component: DomainRow,
    data: domainsData ?? [],
    request: isLargeAccount ? getDomains : undefined,
    handlers,
    loading: domainsLoading,
    error: domainsError.read,
    lastUpdated: domainsLastUpdated,
  };

  if (domainsLoading) {
    return <RenderLoading />;
  }

  if (domainsError.read) {
    return <RenderError />;
  }

  if (!isLargeAccount && domainsData?.length === 0) {
    /**
     * We don't know whether or not a large account is empty or not
     * until Pagey has made its first request, and putting this
     * empty state inside of Pagey would be weird/difficult.
     *
     * The other option is to make an initial request when this
     * component mounts, which Pagey would ignore.
     *
     * I think a slightly different empty state for large accounts is
     * the best trade-off until we have the thing-count endpoint,
     * but open to persuasion on this.
     */
    return (
      <>
        <RenderEmpty
          onCreateDomain={navigateToCreate}
          onImportZone={openImportZoneDrawer}
        />
        <DomainZoneImportDrawer
          open={importDrawerOpen}
          onClose={closeImportZoneDrawer}
          onSuccess={handleSuccess}
        />
      </>
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
    domainsData &&
    domainsData.length > 0;

  return (
    <>
      <DocumentTitleSegment segment="Domains" />
      <DomainBanner hidden={!shouldShowBanner} />
      {props.location.state?.recordError && (
        <Notice error text={props.location.state.recordError} />
      )}
      <PreferenceToggle<boolean>
        preferenceKey="domains_group_by_tag"
        preferenceOptions={[false, true]}
        localStorageKey="GROUP_DOMAINS"
        toggleCallbackFnDebounced={toggleDomainsGroupBy}
        /** again, this value prop should be undefined - purely for the unit test's sake */
        value={props.shouldGroupDomains}
      >
        {({
          preference: domainsAreGrouped,
          togglePreference: toggleGroupDomains,
        }: ToggleProps<boolean>) => {
          return (
            <div className={classes.root}>
              <LandingHeader
                title="Domains"
                extraActions={
                  <Button
                    className={classes.importButton}
                    onClick={openImportZoneDrawer}
                    buttonType="secondary"
                  >
                    Import a Zone
                  </Button>
                }
                entity="Domain"
                onAddNew={navigateToCreate}
                docsLink="https://www.linode.com/docs/platform/manager/dns-manager/"
              />
              <EntityTable
                entity="domain"
                headers={getHeaders(
                  matchesXsDown,
                  matchesSmDown,
                  matchesMdDown
                )}
                row={domainRow}
                initialOrder={initialOrder}
                toggleGroupByTag={toggleGroupDomains}
                isGroupedByTag={domainsAreGrouped}
                isLargeAccount={isLargeAccount}
                normalizeData={(pageyData: Domain[]) => {
                  // Use Redux copies of each Domain, since Redux is more up-to-date.
                  return getReduxCopyOfDomains(pageyData, props.domainsByID);
                }}
                // Persist Pagey data to Redux.
                persistData={(data: Domain[]) => {
                  props.upsertMultipleDomains(data);
                }}
              />
            </div>
          );
        }}
      </PreferenceToggle>
      <DomainZoneImportDrawer
        open={importDrawerOpen}
        onClose={closeImportZoneDrawer}
        onSuccess={handleSuccess}
      />
      <DisableDomainDialog
        updateDomain={props.updateDomain}
        selectedDomainID={selectedDomainID}
        selectedDomainLabel={selectedDomainLabel}
        closeDialog={() => setDisableDialogOpen(false)}
        open={disableDialogOpen}
      />
      <DeletionDialog
        typeToConfirm
        entity="domain"
        open={removeDialogOpen}
        label={selectedDomainLabel}
        loading={removeDialogLoading}
        error={removeDialogError}
        onClose={closeRemoveDialog}
        onDelete={removeDomain}
      />
    </>
  );
};

const RenderLoading: React.FC<{}> = () => {
  return <CircleProgress />;
};

const RenderError: React.FC<{}> = () => {
  return (
    <ErrorState errorText="There was an error retrieving your domains. Please reload and try again." />
  );
};

const RenderEmpty: React.FC<{
  onCreateDomain: () => void;
  onImportZone: () => void;
}> = (props) => {
  return (
    <>
      <DocumentTitleSegment segment="Domains" />
      <Placeholder
        title="Domains"
        isEntity
        icon={DomainIcon}
        buttonProps={[
          {
            onClick: props.onCreateDomain,
            children: 'Create Domain',
          },
          {
            onClick: props.onImportZone,
            children: 'Import a Zone',
          },
        ]}
      >
        <Typography variant="subtitle1">
          Create a Domain, add Domain records, import zones and domains.
        </Typography>
        <Typography variant="subtitle1">
          <Link to="https://www.linode.com/docs/platform/manager/dns-manager-new-manager/">
            Get help managing your Domains
          </Link>
          &nbsp;or&nbsp;
          <Link to="https://www.linode.com/docs/">
            visit our guides and tutorials.
          </Link>
        </Typography>
      </Placeholder>
    </>
  );
};

const eventCategory = `domains landing`;

const toggleDomainsGroupBy = (checked: boolean) =>
  sendGroupByTagEnabledEvent(eventCategory, checked);

interface DispatchProps {
  openForCloning: (domain: string, id: number) => void;
  openForEditing: (domain: string, id: number) => void;
  openForCreating: (origin: DomainDrawerOrigin) => void;
  upsertMultipleDomains: (domains: Domain[]) => void;
}

interface StateProps {
  howManyLinodesOnAccount: number;
  linodesLoading: boolean;
  isRestrictedUser: boolean;
  isLargeAccount: boolean;
  domainsByID: Record<string, Domain>;
}

const mapStateToProps: MapStateToProps<StateProps, {}, ApplicationState> = (
  state
) => ({
  howManyLinodesOnAccount: state.__resources.linodes.results,
  linodesLoading: pathOr(false, ['linodes', 'loading'], state.__resources),
  isRestrictedUser: pathOr(
    true,
    ['__resources', 'profile', 'data', 'restricted'],
    state
  ),
  isLargeAccount: state.__resources.accountManagement.isLargeAccount,
  domainsByID: state.__resources.domains.itemsById,
});

export const connected = connect(mapStateToProps, {
  openForCreating,
  openForCloning,
  openForEditing: _openForEditing,
  upsertMultipleDomains,
});

export default compose<CombinedProps, Props>(
  domainsContainer(),
  connected,
  withSnackbar
)(DomainsLanding);

// Given a list of "baseDomains" (requested from the API via Pagey) and a record of Domains
// from Redux, return the Redux copy of each base Domain. This is useful because the Redux
// copy of the Domain may have updates the original data from Pagey doesn't.
export const getReduxCopyOfDomains = (
  baseDomains: Domain[],
  reduxDomains: Record<string, Domain>
) => {
  return baseDomains.reduce((acc, thisDomain) => {
    const thisReduxDomain = reduxDomains[thisDomain.id];
    if (thisReduxDomain) {
      return [...acc, thisReduxDomain];
    }
    return acc;
  }, []);
};
