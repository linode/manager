import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/filter';
import TagsPanel from 'src/components/TagsPanel';
import { lishLaunch } from 'src/features/Lish';
import { scheduleOrQueueMigration } from 'src/services/linodes';
import { LinodeActionsProps, withLinodeActions } from 'src/store/linodes/linode.containers';
import { requestNotifications } from 'src/store/notification/notification.requests';
import { MapState, ThunkDispatch } from 'src/store/types';
import LabelPowerAndConsolePanel from './HeaderSections/LabelPowerAndConsolePanel';
import NotificationsAndUpgradePanel from './HeaderSections/NotificationsAndUpgradePanel';
import TabsAndStatusBarPanel from './HeaderSections/TabsAndStatusBarPanel';

interface LabelInput {
  label: string;
  errorText: string;
  onEdit: (label: string) => Promise<any>;
  onCancel: () => void;
}

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeStatus: Linode.LinodeStatus;
  linodeRegion: string;
  linodeRecentEvent?: Linode.Event;
  linodeTags: string[];
  linodeConfigs: Linode.Config[];
  linodeUpdate: (...args: any[]) => Promise<any>;
  showPendingMutation: boolean;
  openMutateDrawer: () => void;
  labelInput: LabelInput;
  url: string;
  history: any;
  openConfigDrawer: (config: Linode.Config[], action: (id: number) => void) => void;
  notifications?: Linode.Notification[];
}

interface State {
  hasScheduledMigration: boolean;
}

type CombinedProps =
  & LinodeActionsProps
  & Props
  & StateProps
  & DispatchProps
  & InjectedNotistackProps;

class LinodesDetailHeader extends React.Component<CombinedProps, State> {
  state: State = {
    hasScheduledMigration: false,
  }

  componentDidMount() {
    const { getNotifications } = this.props.actions;
    getNotifications();
  }

  migrate = (type: string) => {
    const { linodeId, enqueueSnackbar } = this.props;
    const { getNotifications } = this.props.actions;
    scheduleOrQueueMigration(linodeId)
      .then((_) => {
        // A 200 response indicates that the operation was successful.
        const successMessage = type === 'migration_scheduled'
          ? "Your Linode has been entered into the migration queue."
          : "Your migration has been scheduled.";
        enqueueSnackbar(successMessage, {
          variant: 'success'
        });
        getNotifications()
      })
      .catch((_) => {
        // @todo: use new error handling pattern here after merge.
        enqueueSnackbar("There was an error starting your migration.", {
          variant: 'error'
        });
      })
  }

  launchLish = () => {
    const { linodeId } = this.props;
    lishLaunch(linodeId);
  }

  editLabel = (value: string) => {
    return this.props.labelInput.onEdit(value)
  }

  handleUpdateTags = (tagsList: string[]) => {
    const { linodeId, linodeUpdate, linodeActions: { updateLinode } } = this.props;

    return updateLinode({ linodeId, tags: tagsList })
      .then(() => {
        linodeUpdate();
      })
  }

  render() {
    const {
      showPendingMutation,
      labelInput,
      notifications,
      url,
      openConfigDrawer,
      linodeTags,
      linodeId,
      linodeLabel,
      linodeRegion,
      linodeStatus,
      linodeRecentEvent,
      linodeConfigs,
    } = this.props;

    return (
      <React.Fragment>
        <NotificationsAndUpgradePanel
          notifications={notifications}
          showPendingMutation={showPendingMutation}
          handleUpgrade={this.props.openMutateDrawer}
          handleMigration={this.migrate}
          status={linodeStatus}
        />
        <LabelPowerAndConsolePanel
          launchLish={this.launchLish}
          linode={{
            id: linodeId,
            label: linodeLabel,
            recentEvent: linodeRecentEvent,
            status: linodeStatus
          }}
          openConfigDrawer={openConfigDrawer}
          labelInput={{
            label: labelInput.label,
            errorText: labelInput.errorText,
            onCancel: labelInput.onCancel,
            onEdit: this.editLabel,
          }}
        />
        <TagsPanel
          tags={linodeTags}
          updateTags={this.handleUpdateTags}
        />
        <TabsAndStatusBarPanel
          url={url}
          history={this.props.history}
          linodeRecentEvent={linodeRecentEvent}
          linodeStatus={linodeStatus}
          linodeId={linodeId}
          linodeRegion={linodeRegion}
          linodeLabel={linodeLabel}
          linodeConfigs={linodeConfigs}
        />
      </React.Fragment>
    );
  }
}

interface DispatchProps {
  actions: {
    getNotifications: () => void;
  },
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (dispatch: ThunkDispatch) => {
  return {
    actions: {
      getNotifications: () => dispatch(requestNotifications()),
    }
  };
};

const filterNotifications = (linodeId: number, notifications: Linode.Notification[] = []) => {
  return notifications.filter((notification) =>
    pathOr(0, ['entity', 'id'], notification) === linodeId
  )
}
const mapStateToProps: MapState<StateProps, Props> = (state, ownProps) => ({
  notificationsLoading: state.__resources.notifications.loading,
  notificationsError: state.__resources.notifications.error,
  // Only use notifications for this Linode.
  notifications: filterNotifications(ownProps.linodeId, state.__resources.notifications.data),
});

interface StateProps {
  notificationsLoading: boolean;
  notificationError?: Error;
  notifications?: Linode.Notification[];
}

export const connected = connect(mapStateToProps, mapDispatchToProps);

export default compose<CombinedProps, Props>(
  connected,
  withSnackbar,
  withLinodeActions,
)(LinodesDetailHeader);
