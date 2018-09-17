import * as React from 'react';
import { Link, matchPath, Redirect, Route, Switch } from 'react-router-dom';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/filter';

import { pathOr } from 'ramda';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import AddCircle from '@material-ui/icons/AddCircle';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import EditableText from 'src/components/EditableText';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import ProductNotification from 'src/components/ProductNotification';

import { linodeInTransition } from 'src/features/linodes/transitions';
import { lishLaunch } from 'src/features/Lish';

import LinodeBackup from './LinodeBackup';
import LinodeNetworking from './LinodeNetworking';
import LinodePowerControl from './LinodePowerControl';
import LinodeRebuild from './LinodeRebuild';
import LinodeRescue from './LinodeRescue';
import LinodeResize from './LinodeResize';
import LinodeSettings from './LinodeSettings';
import LinodeSummary from './LinodeSummary';
import LinodeBusyStatus from './LinodeSummary/LinodeBusyStatus';
import LinodeTag from './LinodeTag';
import LinodeVolumes from './LinodeVolumes';

import Select from 'src/components/EnhancedSelect/Select';

import { addTagsToLinode } from 'src/services/linodes';
import { getTags } from 'src/services/tags';

type ClassNames = 'link'
  | 'backButton'
  | 'titleWrapper'
  | 'cta'
  | 'launchButton';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  titleWrapper: {
    display: 'flex',
    marginTop: 5,
  },
  backButton: {
    margin: '5px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34,
    },
  },
  cta: {
    marginTop: theme.spacing.unit,
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      display: 'flex',
      flexBasis: '100%',
    },
  },
  launchButton: {
    marginRight: theme.spacing.unit,
    padding: '12px 16px 13px',
    minHeight: 50,
    transition: theme.transitions.create(['background-color', 'color']),
    [theme.breakpoints.down('sm')]: {
      backgroundColor: theme.color.white,
      border: `1px solid ${theme.color.border1}`,
      marginTop: 0,
      minHeight: 51,
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      borderColor: theme.palette.primary.main,
    },
  },
  link: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    }
  }
});

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
  handleDeleteTag: (label: string) => void;
  listDeletingTags: string[];
}

interface Item {
  label: string;
  value: string;
}

interface Tag {
  label: string
}

interface State {
  tags?: Item[];
  tagError: string;
  isCreatingTag: boolean;
}

interface ActionMeta {
  action: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodesDetailHeader extends React.Component<CombinedProps, State> {
  state: State = {
    tags: [],
    tagError: '',
    isCreatingTag: false,
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
        this.setState({ tags: reshapedTags })
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

  editLabel = (e: any) => {
    this.props.labelInput.onEdit(e.target.value)
  }

  goToOldManager = () => {
    const { linode } = this.props;
    window.open(`https://manager.linode.com/linodes/mutate/${linode.label}`)
  }

  handleToggleCreate = () => {
    this.setState({ isCreatingTag: !this.state.isCreatingTag })
  }

  handleCreateTag = (value: Item, actionMeta: ActionMeta) => {
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
    addTagsToLinode(
      linode.id,
      [...linode.tags, value.label]
    )
      .then(() => {
        linode.update();
        /*
         * Filter out the new tag out of the auto-suggestion list
         * since we can't attach this tag to the Linode anymore 
         */
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
      classes,
      labelInput,
      linode,
      url,
      notifications,
      handleDeleteTag,
      listDeletingTags,
    } = this.props;

    return (
      <React.Fragment>
        {showPendingMutation &&
          <Notice important warning>
            {`This Linode has pending upgrades available. To learn more about
          this upgrade and what it includes, `}
            {/** @todo change onClick to open mutate drawer once migrate exists */}
            <span className={classes.link} onClick={this.goToOldManager}>
              please visit the classic Linode Manager.
          </span>
          </Notice>
        }
        <Grid
          container
          justify="space-between"
        >
          <Grid item className={classes.titleWrapper}>
            <Link to={`/linodes`}>
              <IconButton
                className={classes.backButton}
              >
                <KeyboardArrowLeft />
              </IconButton>
            </Link>
            <EditableText
              role="header"
              variant="headline"
              text={labelInput.label}
              errorText={labelInput.errorText}
              onEdit={this.editLabel}
              onCancel={labelInput.onCancel}
              data-qa-label
            />
          </Grid>
          <Grid item className={classes.cta}>
            <Button
              onClick={this.launchLish}
              className={classes.launchButton}
              data-qa-launch-console
            >
              Launch Console
          </Button>
            <LinodePowerControl
              status={linode.status}
              recentEvent={linode.recentEvent}
              id={linode.id}
              label={linode.label}
              openConfigDrawer={this.props.openConfigDrawer}
            />
          </Grid>
        </Grid>
        {linode.tags.map(eachTag => {
          return (
            <LinodeTag
              key={eachTag}
              label={eachTag}
              variant="gray"
              tagLabel={eachTag}
              onDelete={handleDeleteTag}
              loading={listDeletingTags.some((inProgressTag) => {
                /*
                 * The tag is getting deleted if it appears in the state
                 * which holds the list of tags queued for deletion 
                 */
                return eachTag === inProgressTag;
              })}
            />
          )
        })}
        {(this.state.isCreatingTag)
          ? <Select
            onChange={this.handleCreateTag}
            options={this.state.tags}
            variant='creatable'
            errorText={this.state.tagError}
            onBlur={this.handleToggleCreate}
          />
          : <AddCircle onClick={this.handleToggleCreate}/>
        }
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
        {
          (notifications || []).map((n, idx) =>
            <ProductNotification key={idx} severity={n.severity} text={n.message} />)
        }
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

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodesDetailHeader);
