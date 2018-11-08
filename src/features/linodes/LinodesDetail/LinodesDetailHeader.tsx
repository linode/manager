import { pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/filter';

import TagsPanel from 'src/components/TagsPanel';

import { lishLaunch } from 'src/features/Lish';
import { sendToast } from 'src/features/ToastNotifications/toasts';

import LabelPowerAndConsolePanel from './HeaderSections/LabelPowerAndConsolePanel';
import NotificationsAndUpgradePanel from './HeaderSections/NotificationsAndUpgradePanel';
import TabsAndStatusBarPanel from './HeaderSections/TabsAndStatusBarPanel';

import { scheduleOrQueueMigration, updateLinode } from 'src/services/linodes';

import { requestNotifications } from 'src/store/reducers/notifications';

interface LabelInput {
  label: string;
  errorText: string;
  onEdit: (label: string) => void;
  onCancel: () => void;
}

interface ReducedLinode {
  id: number;
  label: string;
  status: Linode.LinodeStatus;
  recentEvent?: Linode.Event;
  tags: string[];
  update: (...args: any[]) => Promise<any>;
}

interface Props {
  showPendingMutation: boolean;
  openMutateDrawer: () => void;
  labelInput: LabelInput;
  linode: ReducedLinode;
  url: string;
  history: any;
  openConfigDrawer: (config: Linode.Config[], action: (id: number) => void) => void;
  notifications?: Linode.Notification[];
}

interface State {
  hasScheduledMigration: boolean;
}

type CombinedProps = Props & StateProps & DispatchProps;

class LinodesDetailHeader extends React.Component<CombinedProps, State> {
  state: State = {
    hasScheduledMigration: false,
  }

  componentDidMount() {
    const { getNotifications } = this.props.actions;
    getNotifications();
  }

  migrate = (type: string) => {
    const { linode } = this.props;
    const { getNotifications } = this.props.actions;
    scheduleOrQueueMigration(linode.id)
      .then((_) => {
        // A 200 response indicates that the operation was successful.
        const successMessage = type === 'migration_scheduled'
          ? "Your Linode has been entered into the migration queue."
          : "Your migration has been scheduled."
        sendToast(successMessage);
        getNotifications()
      })
      .catch((_) => {
        // @todo: use new error handling pattern here after merge.
        sendToast("There was an error starting your migration.", "error");
      })
  }

  launchLish = () => {
    const { linode } = this.props;
    lishLaunch(linode.id);
  }

  editLabel = (value: string) => {
    this.props.labelInput.onEdit(value)
  }

  handleUpdateTag(tagsList: string[]) {
    const { linode } = this.props;
    return updateLinode(
      linode.id,
      { tags: tagsList }
    )
      .then(() => {
        linode.update();
      })
  }

  render() {
    const {
      showPendingMutation,
      labelInput,
      linode,
      notifications,
      url,
      openConfigDrawer,
    } = this.props;

    return (
      <React.Fragment>
        <NotificationsAndUpgradePanel
          notifications={notifications}
          showPendingMutation={showPendingMutation}
          handleUpgrade={this.props.openMutateDrawer}
          handleMigration={this.migrate}
          status={linode.status}
        />
        <LabelPowerAndConsolePanel
          launchLish={this.launchLish}
          linode={{
            id: linode.id,
            label: linode.label,
            recentEvent: linode.recentEvent,
            status: linode.status
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
          tags={linode.tags}
          updateTags={this.handleUpdateTag.bind(this)}
        />
        <TabsAndStatusBarPanel
          url={url}
          history={this.props.history}
          linode={{
            status: linode.status,
            recentEvent: linode.recentEvent
          }}
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

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (dispatch, ownProps) => {
  return {
    actions: {
      getNotifications: () => dispatch(requestNotifications()),
    }
  };
};

const filterNotifications = (linodeId: number, notifications: Linode.Notification[] = []) => {
    return notifications.filter((notification) =>
      pathOr(0, ['entity','id'], notification) === linodeId
    )
}

const mapStateToProps: MapStateToProps<StateProps, Props, ApplicationState> = (state, ownProps) => ({
  notificationsLoading: state.notifications.loading,
  notificationsError: state.notifications.error,
  // Only use notifications for this Linode.
  notifications: filterNotifications(ownProps.linode.id, state.notifications.data),
});

interface StateProps {
  notificationsLoading: boolean;
  notificationError?: Error;
  notifications?: Linode.Notification[];
}

export const connected = connect(mapStateToProps, mapDispatchToProps);

export default connected(LinodesDetailHeader);
