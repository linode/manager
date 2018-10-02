import { clone, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/filter';

import { lishLaunch } from 'src/features/Lish';
import { sendToast } from 'src/features/ToastNotifications/toasts';

import LabelPowerAndConsolePanel from './HeaderSections/LabelPowerAndConsolePanel';
import NotificationsAndUpgradePanel from './HeaderSections/NotificationsAndUpgradePanel';
import TabsAndStatusBarPanel from './HeaderSections/TabsAndStatusBarPanel';
import TagsPanel from './HeaderSections/TagsPanel';

import { scheduleOrQueueMigration, updateLinode } from 'src/services/linodes';
import { getTags } from 'src/services/tags';

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

interface Item {
  label: string;
  value: string;
}

interface Tag {
  label: string
}

interface State {
  tagsToSuggest?: Item[];
  tagError: string;
  isCreatingTag: boolean;
  tagInputValue: string;
  listDeletingTags: string[];
  hasScheduledMigration: boolean;
}

interface ActionMeta {
  action: string;
}

type CombinedProps = Props & StateProps & DispatchProps;

class LinodesDetailHeader extends React.Component<CombinedProps, State> {
  state: State = {
    tagsToSuggest: [],
    tagError: '',
    isCreatingTag: false,
    tagInputValue: '',
    listDeletingTags: [],
    hasScheduledMigration: false,
  }

  componentDidMount() {
    const { linode } = this.props;
    const { getNotifications } = this.props.actions;
    getNotifications();
    getTags()
      .then(response => {
        /*
         * The end goal is to display to the user a list of auto-suggestions
         * when they start typing in a new tag, but we don't want to display
         * tags that are already applied to this specific Linode because there cannot
         * be duplicates on one Linode.
         */
        const filteredTags = response.data.filter((eachTag: Tag) => {
          return !linode.tags.some((alreadyAppliedTag: string) => {
            return alreadyAppliedTag === eachTag.label;
          })
        })
        /*
         * reshaping them for the purposes of being passed to the Select component
         */
        const reshapedTags = filteredTags.map((eachTag: Tag) => {
          return {
            label: eachTag.label,
            value: eachTag.label
          }
        });
        this.setState({ tagsToSuggest: reshapedTags })
      })
      .catch(e => e)
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

  handleToggleCreate = () => {
    this.setState({ isCreatingTag: !this.state.isCreatingTag })
  }

  handleDeleteTag = (label: string) => {
    const { linode } = this.props;
    /*
     * Add this tag to the current list of tags that are queued for deletion
     */
    this.setState({
      listDeletingTags: [
        ...this.state.listDeletingTags,
        label
      ]
    })
    /*
     * Update the linode with the new list of tags (which is the previous list but
     * with the deleted tag filtered out). It's important to note that the Tag is *not*
     * being deleted here - it's just being removed from the Linode
     */
    const linodeTagsWithoutDeletedTag = linode.tags.filter((eachTag: string) => {
      return eachTag !== label
    })
    updateLinode(linode.id, { tags: linodeTagsWithoutDeletedTag })
      .then(() => {
        linode.update();
        /*
        * Remove this tag from the current list of tags that are queued for deletion
        */
       const cloneTagSuggestions = clone(this.state.tagsToSuggest) || [];
        this.setState({
          tagsToSuggest: [
            {
              value: label,
              label,
            },
            ...cloneTagSuggestions
          ],
          listDeletingTags: this.state.listDeletingTags.filter(eachTag => eachTag !== label),
        })
      })
      .catch(e => {
        sendToast(`Could not delete Tag: ${label}`);
        /*
        * Remove this tag from the current list of tags that are queued for deletion
        */
        this.setState({
          listDeletingTags: this.state.listDeletingTags.filter(eachTag => eachTag !== label)
        })
      })
  }

  handleCreateTag = (value: Item, actionMeta: ActionMeta) => {
    const { tagsToSuggest } = this.state;
    /*
     * This comes from the react-select API
     * basically, we only want to make a request if the user is either
     * hitting the enter button or choosing a selection from the dropdown
     */
    if (actionMeta.action !== 'select-option'
      && actionMeta.action !== 'create-option') { return; }

    this.setState({
      tagError: '',
    });

    const { linode } = this.props;
    updateLinode(
      linode.id,
      { tags: [...linode.tags, value.label] }
    )
      .then(() => {
        linode.update();
        // set the input value to blank on submit
        this.setState({ tagInputValue: '' })
        /*
        * Filter out the new tag out of the auto-suggestion list
        * since we can't attach this tag to the Linode anymore
        */
        const cloneTagSuggestions = clone(tagsToSuggest) || [];
        const filteredTags = cloneTagSuggestions.filter((eachTag: Item) => {
          return eachTag.label !== value.label;
        });
        this.setState({
          tagsToSuggest: filteredTags
        })
      })
      .catch(e => {
        const APIErrors = pathOr(
          'Error while creating tag',
          ['response', 'data', 'errors'],
          e);
        // display the first error in the array or a generic one
        this.setState({ tagError: APIErrors[0].reason || 'Error while creating tag' })
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
          tags={{
            tagsQueuedForDeletion: this.state.listDeletingTags,
            tagsAlreadyAppliedToLinode: linode.tags,
            tagsToSuggest: this.state.tagsToSuggest || []
          }}
          onDeleteTag={this.handleDeleteTag}
          toggleCreateTag={this.handleToggleCreate}
          onCreateTag={this.handleCreateTag}
          tagInputValue={this.state.tagInputValue}
          isCreatingTag={this.state.isCreatingTag}
          tagError={this.state.tagError}
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
