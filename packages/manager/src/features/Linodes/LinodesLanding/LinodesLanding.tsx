import { CircleProgress, ErrorState } from '@linode/ui';
import * as React from 'react';
import { withRouter } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';
import { MaintenanceBanner } from 'src/components/MaintenanceBanner/MaintenanceBanner';
import OrderBy from 'src/components/OrderBy';
import { PreferenceToggle } from 'src/components/PreferenceToggle/PreferenceToggle';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { TransferDisplay } from 'src/components/TransferDisplay/TransferDisplay';
import { withFeatureFlags } from 'src/containers/flags.container';
import { withProfile } from 'src/containers/profile.container';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { BackupsCTA } from 'src/features/Backups/BackupsCTA';
import { MigrateLinode } from 'src/features/Linodes/MigrateLinode/MigrateLinode';
import {
  sendGroupByTagEnabledEvent,
  sendLinodesViewEvent,
} from 'src/utilities/analytics/customEventAnalytics';

import { EnableBackupsDialog } from '../LinodesDetail/LinodeBackup/EnableBackupsDialog';
import { LinodeRebuildDialog } from '../LinodesDetail/LinodeRebuild/LinodeRebuildDialog';
import { RescueDialog } from '../LinodesDetail/LinodeRescue/RescueDialog';
import { LinodeResize } from '../LinodesDetail/LinodeResize/LinodeResize';
import { PowerActionsDialog } from '../PowerActionsDialogOrDrawer';
import { CardView } from './CardView';
import { DeleteLinodeDialog } from './DeleteLinodeDialog';
import { DisplayGroupedLinodes } from './DisplayGroupedLinodes';
import { DisplayLinodes } from './DisplayLinodes';
import {
  StyledLinkContainerGrid,
  StyledWrapperGrid,
} from './LinodesLanding.styles';
import { LinodesLandingCSVDownload } from './LinodesLandingCSVDownload';
import { LinodesLandingEmptyState } from './LinodesLandingEmptyState';
import { ListView } from './ListView';
import { statusToPriority } from './utils';

import type { Action } from '../PowerActionsDialogOrDrawer';
import type { ExtendedStatus } from './utils';
import type { Config } from '@linode/api-v4/lib/linodes/types';
import type { APIError } from '@linode/api-v4/lib/types';
import type { RouteComponentProps } from 'react-router-dom';
import type { WithFeatureFlagProps } from 'src/containers/flags.container';
import type { WithProfileProps } from 'src/containers/profile.container';
import type { DialogType } from 'src/features/Linodes/types';
import type { LinodeWithMaintenance } from 'src/utilities/linodes';
import type { RegionFilter } from 'src/utilities/storage';

interface State {
  deleteDialogOpen: boolean;
  enableBackupsDialogOpen: boolean;
  groupByTag: boolean;
  linodeMigrateOpen: boolean;
  linodeResizeOpen: boolean;
  powerDialogAction?: Action;
  powerDialogOpen: boolean;
  rebuildDialogOpen: boolean;
  rescueDialogOpen: boolean;
  selectedLinodeConfigs?: Config[];
  selectedLinodeID?: number;
  selectedLinodeLabel?: string;
}

export interface LinodeHandlers {
  onOpenDeleteDialog: () => void;
  onOpenMigrateDialog: () => void;
  onOpenPowerDialog: (action: Action) => void;
  onOpenRebuildDialog: () => void;
  onOpenRescueDialog: () => void;
  onOpenResizeDialog: () => void;
}

interface Params {
  groupByTag?: 'false' | 'true';
  view?: string;
}

type RouteProps = RouteComponentProps<Params>;

export interface LinodesLandingProps {
  LandingHeader?: React.ReactElement;
  filteredLinodesLoading: boolean;
  handleRegionFilter: (regionFilter: RegionFilter) => void;
  linodesData: LinodeWithMaintenance[];
  linodesInTransition: Set<number>;
  linodesRequestError?: APIError[];
  linodesRequestLoading: boolean;
  someLinodesHaveScheduledMaintenance: boolean;
  /** Keep track of total number of linodes for filtering and empty state landing page logic */
  totalNumLinodes: number;
}

type CombinedProps = LinodesLandingProps &
  RouteProps &
  WithFeatureFlagProps &
  WithProfileProps;

class ListLinodes extends React.Component<CombinedProps, State> {
  changeView = (style: 'grid' | 'list') => {
    sendLinodesViewEvent(eventCategory, style);
    const { history, location } = this.props;
    const query = new URLSearchParams(location.search);
    query.set('view', style);
    history.push(`?${query.toString()}`);
  };

  closeDialogs = () => {
    this.setState({
      deleteDialogOpen: false,
      enableBackupsDialogOpen: false,
      linodeMigrateOpen: false,
      linodeResizeOpen: false,
      powerDialogOpen: false,
      rebuildDialogOpen: false,
      rescueDialogOpen: false,
    });
  };

  openDialog = (type: DialogType, linodeID: number, linodeLabel?: string) => {
    switch (type) {
      case 'delete':
        this.setState({
          deleteDialogOpen: true,
        });
        break;
      case 'resize':
        this.setState({
          linodeResizeOpen: true,
        });
        break;
      case 'migrate':
        this.setState({
          linodeMigrateOpen: true,
        });
        break;
      case 'rebuild':
        this.setState({
          rebuildDialogOpen: true,
        });
        break;
      case 'rescue':
        this.setState({
          rescueDialogOpen: true,
        });
        break;
      case 'enable_backups':
        this.setState({
          enableBackupsDialogOpen: true,
        });
        break;
    }
    this.setState({
      selectedLinodeID: linodeID,
      selectedLinodeLabel: linodeLabel,
    });
  };

  openPowerDialog = (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => {
    this.setState({
      powerDialogAction: bootAction,
      powerDialogOpen: true,
      selectedLinodeConfigs: linodeConfigs,
      selectedLinodeID: linodeID,
      selectedLinodeLabel: linodeLabel,
    });
  };

  state: State = {
    deleteDialogOpen: false,
    enableBackupsDialogOpen: false,
    groupByTag: false,
    linodeMigrateOpen: false,
    linodeResizeOpen: false,
    powerDialogOpen: false,
    rebuildDialogOpen: false,
    rescueDialogOpen: false,
  };

  updatePageUrl = (page: number) => {
    this.props.history.push(`?page=${page}`);
  };

  render() {
    const {
      filteredLinodesLoading,
      grants,
      handleRegionFilter,
      linodesData,
      linodesInTransition,
      linodesRequestError,
      linodesRequestLoading,
      profile,
      totalNumLinodes,
    } = this.props;

    const isLinodesGrantReadOnly =
      Boolean(profile.data?.restricted) &&
      !grants.data?.global?.['add_linodes'];

    const params = new URLSearchParams(this.props.location.search);

    const view =
      params.has('view') && ['grid', 'list'].includes(params.get('view')!)
        ? (params.get('view') as 'grid' | 'list')
        : undefined;

    const componentProps = {
      openDialog: this.openDialog,
      openPowerActionDialog: this.openPowerDialog,
      someLinodesHaveMaintenance: this.props
        .someLinodesHaveScheduledMaintenance,
    };

    if (linodesRequestError) {
      let errorText: JSX.Element | string =
        linodesRequestError?.[0]?.reason ?? 'Error loading Linodes';

      if (
        typeof errorText === 'string' &&
        errorText.toLowerCase() === 'this linode has been suspended'
      ) {
        errorText = (
          <React.Fragment>
            One or more of your Linodes is suspended. Please{' '}
            <Link to="/support/tickets">open a support ticket </Link>
            if you have questions.
          </React.Fragment>
        );
      }

      return (
        <React.Fragment>
          <DocumentTitleSegment segment="Linodes" />
          <ErrorState errorText={errorText} />
        </React.Fragment>
      );
    }

    if (linodesRequestLoading) {
      return <CircleProgress />;
    }

    if (totalNumLinodes === 0 && linodesData.length === 0) {
      return (
        <>
          <ProductInformationBanner bannerLocation="Linodes" />
          <LinodesLandingEmptyState />
        </>
      );
    }

    return (
      <React.Fragment>
        <LinodeResize
          linodeId={this.state.selectedLinodeID}
          linodeLabel={this.state.selectedLinodeLabel}
          onClose={this.closeDialogs}
          open={this.state.linodeResizeOpen}
        />
        <MigrateLinode
          linodeId={this.state.selectedLinodeID ?? -1}
          onClose={this.closeDialogs}
          open={this.state.linodeMigrateOpen}
        />
        <LinodeRebuildDialog
          linodeId={this.state.selectedLinodeID}
          linodeLabel={this.state.selectedLinodeLabel}
          onClose={this.closeDialogs}
          open={this.state.rebuildDialogOpen}
        />
        <RescueDialog
          linodeId={this.state.selectedLinodeID ?? -1}
          linodeLabel={this.state.selectedLinodeLabel}
          onClose={this.closeDialogs}
          open={this.state.rescueDialogOpen}
        />
        <EnableBackupsDialog
          linodeId={this.state.selectedLinodeID ?? -1}
          onClose={this.closeDialogs}
          open={this.state.enableBackupsDialogOpen}
        />
        {!!this.state.selectedLinodeID && !!this.state.selectedLinodeLabel && (
          <React.Fragment>
            <PowerActionsDialog
              action={this.state.powerDialogAction ?? 'Power On'}
              isOpen={this.state.powerDialogOpen}
              linodeId={this.state.selectedLinodeID}
              linodeLabel={this.state.selectedLinodeLabel}
              onClose={this.closeDialogs}
            />
            <DeleteLinodeDialog
              linodeId={this.state.selectedLinodeID}
              linodeLabel={this.state.selectedLinodeLabel}
              onClose={this.closeDialogs}
              open={this.state.deleteDialogOpen}
            />
          </React.Fragment>
        )}
        {this.props.someLinodesHaveScheduledMaintenance && (
          <MaintenanceBanner />
        )}
        <DocumentTitleSegment segment="Linodes" />
        <ProductInformationBanner bannerLocation="Linodes" />
        <PreferenceToggle
          preferenceKey="linodes_group_by_tag"
          preferenceOptions={[false, true]}
          toggleCallbackFn={sendGroupByAnalytic}
        >
          {({
            preference: linodesAreGrouped,
            togglePreference: toggleGroupLinodes,
          }) => {
            return (
              <PreferenceToggle
                preferenceKey="linodes_view_style"
                preferenceOptions={['list', 'grid']}
                toggleCallbackFn={this.changeView}
                /**
                 * we want the URL query param to take priority here, but if it's
                 * undefined, just use the user preference
                 */
                value={view}
              >
                {({
                  preference: linodeViewPreference,
                  togglePreference: toggleLinodeView,
                }) => {
                  return (
                    <React.Fragment>
                      <React.Fragment>
                        <BackupsCTA />
                        {this.props.LandingHeader ? (
                          this.props.LandingHeader
                        ) : (
                          <LandingHeader
                            buttonDataAttrs={{
                              tooltipText: getRestrictedResourceText({
                                action: 'create',
                                isSingular: false,
                                resourceType: 'Linodes',
                              }),
                            }}
                            onButtonClick={() =>
                              this.props.history.push('/linodes/create')
                            }
                            disabledCreateButton={isLinodesGrantReadOnly}
                            docsLink="https://techdocs.akamai.com/cloud-computing/docs/faqs-for-compute-instances"
                            entity="Linode"
                            title="Linodes"
                          />
                        )}
                      </React.Fragment>

                      <OrderBy
                        data={(linodesData ?? []).map((linode) => {
                          // Determine the priority of this Linode's status.
                          // We have to check for "Maintenance" and "Busy" since these are
                          // not actual Linode statuses (we derive them client-side).
                          let _status: ExtendedStatus = linode.status;
                          if (linode.maintenance) {
                            _status = 'maintenance';
                          } else if (linodesInTransition.has(linode.id)) {
                            _status = 'busy';
                          }

                          return {
                            ...linode,
                            _statusPriority: statusToPriority(_status),
                            displayStatus: linode.maintenance
                              ? 'maintenance'
                              : linode.status,
                          };
                        })}
                        orderBy={
                          this.props.someLinodesHaveScheduledMaintenance
                            ? '_statusPriority'
                            : 'label'
                        }
                        // If there are Linodes with scheduled maintenance, default to
                        // sorting by status priority so they are more visible.
                        order="asc"
                        preferenceKey={'linodes-landing'}
                      >
                        {({ data, handleOrderChange, order, orderBy }) => {
                          const finalProps = {
                            ...componentProps,
                            data,
                            handleOrderChange,
                            order,
                            orderBy,
                          };

                          return linodesAreGrouped ? (
                            <DisplayGroupedLinodes
                              {...finalProps}
                              component={
                                linodeViewPreference === 'grid'
                                  ? CardView
                                  : ListView
                              }
                              display={linodeViewPreference}
                              filteredLinodesLoading={filteredLinodesLoading}
                              handleRegionFilter={handleRegionFilter}
                              linodeViewPreference={linodeViewPreference}
                              linodesAreGrouped={true}
                              toggleGroupLinodes={toggleGroupLinodes}
                              toggleLinodeView={toggleLinodeView}
                            />
                          ) : (
                            <DisplayLinodes
                              {...finalProps}
                              component={
                                linodeViewPreference === 'grid'
                                  ? CardView
                                  : ListView
                              }
                              display={linodeViewPreference}
                              filteredLinodesLoading={filteredLinodesLoading}
                              handleRegionFilter={handleRegionFilter}
                              linodeViewPreference={linodeViewPreference}
                              linodesAreGrouped={false}
                              toggleGroupLinodes={toggleGroupLinodes}
                              toggleLinodeView={toggleLinodeView}
                              updatePageUrl={this.updatePageUrl}
                            />
                          );
                        }}
                      </OrderBy>
                      <StyledWrapperGrid container justifyContent="flex-end">
                        <StyledLinkContainerGrid>
                          <LinodesLandingCSVDownload />
                        </StyledLinkContainerGrid>
                      </StyledWrapperGrid>
                    </React.Fragment>
                  );
                }}
              </PreferenceToggle>
            );
          }}
        </PreferenceToggle>
        <TransferDisplay />
      </React.Fragment>
    );
  }
}

const eventCategory = 'linodes landing';

const sendGroupByAnalytic = (value: boolean) => {
  sendGroupByTagEnabledEvent(eventCategory, value);
};

export default withRouter(withProfile(withFeatureFlags(ListLinodes)));
