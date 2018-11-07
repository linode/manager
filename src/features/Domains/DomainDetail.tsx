import { clone, compose, pathOr } from 'ramda';
import * as React from 'react';

import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';

import { matchPath, Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import setDocs from 'src/components/DocsSidebar/setDocs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import TagsPanel from 'src/components/TagsPanel';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import { getDomain, getDomainRecords, updateDomain } from 'src/services/domains';
import { getTags } from 'src/services/tags';

import DomainRecords from './DomainRecords';

interface Item {
  label: string;
  value: string;
}

interface Tag {
  label: string
}

interface State {
  error?: Error;
  domain: Linode.Domain;
  records: Linode.Record[];
  tagsToSuggest?: Item[];
  tagError: string;
  tagInputValue: string;
  listDeletingTags: string[];

}

interface ActionMeta {
  action: string;
}

type RouteProps = RouteComponentProps<{ domainId?: number }>;

interface PreloadedProps {
  domain: PromiseLoaderResponse<Linode.Domain>;
  records: PromiseLoaderResponse<Linode.Record>;
}

type ClassNames = 'root'
  | 'titleWrapper'
  | 'backButton';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    wordBreak: 'break-all',
  },
  backButton: {
    margin: '2px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34,
    },
  },
});

type CombinedProps = RouteProps & PreloadedProps & WithStyles<ClassNames>;

const preloaded = PromiseLoader<CombinedProps>({
  domain: ({ match: { params: { domainId } } }) => {
    if (!domainId) {
      return Promise.reject(new Error('domainId param not set.'));
    }

    return getDomain(domainId);
  },

  records: ({ match: { params: { domainId } } }) => {
    if (!domainId) {
      return Promise.reject(new Error('domainId param not set.'));
    }

    return getDomainRecords(domainId);
  },
});

class DomainDetail extends React.Component<CombinedProps, State> {

  state: State = {
    domain: pathOr(undefined, ['response'], this.props.domain),
    records: pathOr([], ['response', 'data'], this.props.records),
    error: pathOr(undefined, ['error'], this.props.domain),
    tagsToSuggest: [],
    tagError: '',
    tagInputValue: '',
    listDeletingTags: [],
  };

  componentDidMount() {
    const { domain: { response: domain } } = this.props;
    getTags()
      .then(response => {
        /*
         * The end goal is to display to the user a list of auto-suggestions
         * when they start typing in a new tag, but we don't want to display
         * tags that are already applied to this specific Domain because there cannot
         * be duplicates on one Domain.
         */
        const filteredTags = response.data.filter((eachTag: Tag) => {
          return !domain.tags.some((alreadyAppliedTag: string) => {
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

  handleDeleteTag = (label: string) => {
    const { domain } = this.state;
    /*
     * Add this tag to the current list of tags that are queued for deletion
     */
    this.setState({
      listDeletingTags: [
        ...this.state.listDeletingTags,
        label
      ]
    }, () => {
      /*
      * Update the Domain with the new list of tags (which is the previous list but
      * with the deleted tag filtered out). It's important to note that the Tag is *not*
      * being deleted here - it's just being removed from the Domain
      */
      const domainTagsWithoutDeletedTag = domain.tags.filter((eachTag: string) => {
        return this.state.listDeletingTags.indexOf(eachTag) === -1;
      });
      updateDomain(domain.id, { domain: domain.domain, tags: domainTagsWithoutDeletedTag })
        .then(domain => {
          this.setState({
            domain,
          })
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

    const { domain } = this.state;
    updateDomain(
      domain.id,
      { domain: domain.domain, tags: [...domain.tags, value.label] }
    )
      .then(domain => {
        this.setState({
          domain,
        })
        // set the input value to blank on submit
        this.setState({ tagInputValue: '' })
        /*
        * Filter out the new tag out of the auto-suggestion list
        * since we can't attach this tag to the Domain anymore
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


  handleTabChange = (event: React.ChangeEvent<HTMLDivElement>, value: number) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  }

  static docs: Linode.Doc[] = [
    {
      title: 'DNS Manager Overview',
      src: 'https://www.linode.com/docs/networking/dns/dns-manager-overview/',
      body: `The DNS Manager is a comprehensive DNS management interface available within the
      Linode Manager that allows you to add DNS records for all of your domain names. This guide
      covers the use of Linode’s DNS Manager and basic domain zone setup. For an introduction to
      DNS in general, please see our Introduction to DNS Records guide.`,
    },
  ];

  tabs: { routeName: string, title: string, disabled?: boolean}[] = [
    { routeName: `${this.props.match.url}/records`, title: 'DNS Records' },
    // { routeName: `${this.props.match.url}/check-zone`, title: 'Check Zone', disabled: true },
    // { routeName: `${this.props.match.url}/zone-file`, title: 'Zone File', disabled: true },
  ];

  updateRecords = () => {
    const { match: { params: { domainId } } } = this.props;
    if (!domainId) { return; }

    getDomainRecords(domainId)
      .then((data) => {
        this.setState({ records: data.data });
      })
      .catch(console.error);
  }

  updateDomain = () => {
    const { match: { params: { domainId } } } = this.props;
    if (!domainId) { return; }

    getDomain(domainId)
      .then((data) => {
        this.setState({ domain: data });
      })
      .catch(console.error);
  }

  goToDomains = () => {
    this.props.history.push('/domains');
  }

  renderDomainRecords = () => {
    const { domain, records } = this.state;
    return (
      <DomainRecords
        domain={domain}
        domainRecords={records}
        updateRecords={this.updateRecords}
        updateDomain={this.updateDomain}
      />
    )
  }

  renderCheckZone = () => {
    return <h1>Check Zone</h1>
  }

  renderZoneFile = () => {
    return <h1>Zone File</h1>
  }

  render() {
    const matches = (p: string) => Boolean(matchPath(p, { path: this.props.location.pathname }));
    const { match: { path, url }, classes } = this.props;
    const { error, domain } = this.state;

    /** Empty State */
    if (!domain) { return null; }

    /** Error State */
    if (error) {
      return (
        <ErrorState
          errorText="There was an error retrieving your domain. Please reload and try again."
        />
      );
    }

    return (
      <React.Fragment>
        <Grid container justify="space-between">
          <Grid item className={classes.titleWrapper}>
            <IconButton
              onClick={this.goToDomains}
              className={classes.backButton}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <Typography role="header" variant="headline" data-qa-domain-title>{domain.domain}</Typography>
          </Grid>
        </Grid>
        <AppBar position="static" color="default">
          <TagsPanel
            tags={{
              tagsQueuedForDeletion: this.state.listDeletingTags,
              tagsAlreadyApplied: domain.tags,
              tagsToSuggest: this.state.tagsToSuggest || []
            }}
            onDeleteTag={this.handleDeleteTag}
            onCreateTag={this.handleCreateTag}
            tagInputValue={this.state.tagInputValue}
            tagError={this.state.tagError}
          />
          <Tabs
            value={this.tabs.findIndex(tab => matches(tab.routeName))}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            scrollable
            scrollButtons="on"
          >
            {
              this.tabs.map(tab =>
                <Tab key={tab.title} label={tab.title} disabled={tab.disabled} />,
              )
            }
          </Tabs>
        </AppBar>
        <Switch>
          <Route
            exact
            path={`${path}/records`}
            render={this.renderDomainRecords}
          />
          <Route exact path={`${path}/check-zone`} render={this.renderCheckZone} />
          <Route exact path={`${path}/zone-file`} render={this.renderZoneFile} />
          {/* 404 */}
          < Redirect to={`${url}/records`} />
        </Switch>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });
const reloaded = reloadableWithRouter<PreloadedProps, { domainId?: number }>(
  (routePropsOld, routePropsNew) => {
    return routePropsOld.match.params.domainId !== routePropsNew.match.params.domainId;
  },
);

export default compose<any, any, any, any, any>(
  setDocs(DomainDetail.docs),
  reloaded,
  styled,
  preloaded,
)(DomainDetail);
