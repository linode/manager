import { clone, pathOr } from 'ramda';
import * as React from 'react';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/filter';

import { lishLaunch } from 'src/features/Lish';
import { sendToast } from 'src/features/ToastNotifications/toasts';

import LabelPowerAndConsolePanel from './HeaderSections/LabelPowerAndConsolePanel';
import NotificationsAndUpgradePanel from './HeaderSections/NotificationsAndUpgradePanel';
import TabsAndStatusBarPanel from './HeaderSections/TabsAndStatusBarPanel';
import TagsPanel from './HeaderSections/TagsPanel';

import { startMigration, updateLinode } from 'src/services/linodes';
import { getTags } from 'src/services/tags';

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
}

interface ActionMeta {
  action: string;
}

type CombinedProps = Props;

class LinodesDetailHeader extends React.Component<CombinedProps, State> {
  state: State = {
    tagsToSuggest: [],
    tagError: '',
    isCreatingTag: false,
    tagInputValue: '',
    listDeletingTags: [],
  }

  componentDidMount() {
    const { linode } = this.props;
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

  enterMigrationQueue = () => {
    const { linode } = this.props; 
    startMigration(linode.id)
      .then((_) => {
        sendToast("Your Linode has been entered into the migration queue.");
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

  goToOldManager = () => {
    const { linode } = this.props;
    window.open(`https://manager.linode.com/linodes/mutate/${linode.label}`)
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
      url,
      notifications,
      openConfigDrawer,
    } = this.props;

    return (
      <React.Fragment>
        <NotificationsAndUpgradePanel
          notifications={notifications}
          showPendingMutation={showPendingMutation}
          handleUpgrade={this.goToOldManager}
          handleMigration={this.enterMigrationQueue}
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

export default LinodesDetailHeader;
