import * as Algolia from 'algoliasearch';
import { compose } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Grid from 'src/components/Grid';
import { ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_KEY, DOCS_BASE_URL } from 'src/constants';

import DocumentationResults, { SearchResult } from './DocumentationResults';
import HelpResources from './HelpResources';

type ClassNames = 'root'
  | 'searchBox'
  | 'searchHeading'
  | 'searchField';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  searchBox: {
    backgroundColor: theme.color.grey2,
    marginLeft: theme.spacing.unit,
    marginRight: '-6px',
  },
  searchHeading: {
    color: theme.color.black,
    marginBottom: theme.spacing.unit * 2,
    fontSize: '175%',
  },
  searchField: {
    padding: theme.spacing.unit * 3,
    width: '100%',
  },
});

interface Props {}

interface State {
  error?: string;
  query: string;
  results: SearchResult[];
}

type CombinedProps = Props & WithStyles<ClassNames> & RouteComponentProps<{}>;

// Algolia API Client
const client = Algolia(ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_KEY);
const searchIndex = client.initIndex('linode-docs');

class SupportSearchLanding extends React.Component<CombinedProps, State> {
  state: State = {
    query: '',
    results: [],
  }

  searchAlgolia = (inputValue:string) => {
    searchIndex.search({
      query: inputValue,
      hitsPerPage: 10,
    }, this.searchSuccess);
  }

  searchSuccess = (err:any, content:any) => {
    if (err) {
      /*
      * Errors from Algolia have the format: {'message':string, 'code':number}
      * We do not want to push these messages on to the user as they are not under
      * our control and can be account-related (e.g. "You have exceeded your quota").
      */
      this.setState({ error: "There was an error retrieving your search results." });
      return;
    }
    const results  = this.convertHitsToItems(content.hits);
    this.setState({ results, error: undefined });
  }

  convertHitsToItems = (hits:any) => {
    if (!hits) { return []; }
    return hits.map((hit:any, idx:number) => {
      return { value: idx, label: hit._highlightResult.title.value, data: {
        source: 'Linode documentation',
        href: DOCS_BASE_URL + hit.href,
      } }
    })
  }

  render() {
    const { query } = this.state;

    return (
      <Grid container direction="column">
        <Grid item>
          <Typography variant="headline" >
            {query ? `Search results for "${query}"` : "Search"} 
         </Typography>
        </Grid>
        <Grid item>
          <DocumentationResults sectionTitle="Most Relevant Documentation" results={[]} target="google.com" />
        </Grid>
        <Grid item>
          <DocumentationResults sectionTitle="Most Relevant Community Posts" results={[]} target="google.com" />
        </Grid>
        <Grid container item>
          <HelpResources />
        </Grid>
      </Grid>
    )
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any,any,any>(
  styled,
  withRouter)(SupportSearchLanding);