import { clone, pathOr } from 'ramda';
import * as React from 'react';
import { matchPath, Redirect, Route, Switch } from 'react-router-dom';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/filter';

import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import { linodeInTransition } from 'src/features/linodes/transitions';
import { lishLaunch } from 'src/features/Lish';
import { sendToast } from 'src/features/ToastNotifications/toasts';

import LabelPowerAndConsolePanel from './HeaderSections/LabelPowerAndConsolePanel';
import NotificationsAndUpgradePanel from './HeaderSections/NotificationsAndUpgradePanel';
import LinodeBackup from './LinodeBackup';
import LinodeNetworking from './LinodeNetworking';
import LinodeRebuild from './LinodeRebuild';
import LinodeRescue from './LinodeRescue';
import LinodeResize from './LinodeResize';
import LinodeSettings from './LinodeSettings';
import LinodeSummary from './LinodeSummary';
import LinodeBusyStatus from './LinodeSummary/LinodeBusyStatus';
import LinodeVolumes from './LinodeVolumes';

import { updateLinode } from 'src/services/linodes';
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

  launchLish = () => {
    const { linode } = this.props;
    lishLaunch(linode.id);
  }

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    { routeName: `${this.props.url}/summary`, title: 'Summary' },
    { routeName: `${this.props.url}/volumes`, title: 'Volumes' },
    { routeName: `${this.props.url}/networking`, title: 'Networking' },
    { routeName: `${this.props.url}/resize`, title: 'Resize' },
    { routeName: `${this.props.url}/rescue`, title: 'Rescue' },
    { routeName: `${this.props.url}/rebuild`, title: 'Rebuild' },
    { routeName: `${this.props.url}/backup`, title: 'Backups' },
    { routeName: `${this.props.url}/settings`, title: 'Settings' },
  ];

  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
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






        {linodeInTransition(linode.status, linode.recentEvent) &&
          <LinodeBusyStatus status={linode.status} recentEvent={linode.recentEvent} />
        }
        <AppBar position="static" color="default">
          <Tabs
            value={this.tabs.findIndex(tab => matches(tab.routeName))}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            scrollable
            scrollButtons="off"
          >
            {this.tabs.map(tab =>
              <Tab key={tab.title} label={tab.title} data-qa-tab={tab.title} />)}
          </Tabs>
        </AppBar>
        <Switch>
          <Route exact path={`${url}/summary`} component={LinodeSummary} />
          <Route exact path={`${url}/volumes`} component={LinodeVolumes} />
          <Route exact path={`${url}/networking`} component={LinodeNetworking} />
          <Route exact path={`${url}/resize`} component={LinodeResize} />
          <Route exact path={`${url}/rescue`} component={LinodeRescue} />
          <Route exact path={`${url}/rebuild`} component={LinodeRebuild} />
          <Route exact path={`${url}/backup`} component={LinodeBackup} />
          <Route exact path={`${url}/settings`} component={LinodeSettings} />
          {/* 404 */}
          <Redirect to={`${url}/summary`} />
        </Switch>
      </React.Fragment>
    );
  }
}

const matches = (p: string) => {
  return Boolean(matchPath(p, { path: location.pathname }));
}

export default LinodesDetailHeader;
