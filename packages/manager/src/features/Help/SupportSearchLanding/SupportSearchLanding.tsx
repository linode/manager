import Search from '@material-ui/icons/Search';
import { compose } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import InputAdornment from 'src/components/core/InputAdornment';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import H1Header from 'src/components/H1Header';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { COMMUNITY_SEARCH_URL, DOCS_SEARCH_URL } from 'src/constants';
import { getQueryParam } from 'src/utilities/queryParams';
import withSearch, { AlgoliaState as AlgoliaProps } from '../SearchHOC';
import DocumentationResults, { SearchResult } from './DocumentationResults';
import HelpResources from './HelpResources';

type ClassNames =
  | 'root'
  | 'searchBar'
  | 'searchBoxInner'
  | 'searchHeading'
  | 'searchField'
  | 'searchIcon';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      maxWidth: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      position: 'relative',
    },
    searchBar: {
      maxWidth: '100%',
    },
    searchBoxInner: {
      padding: theme.spacing(3),
      backgroundColor: theme.color.grey2,
      marginTop: 0,
      '& > div': {
        maxWidth: '100%',
      },
    },
    searchHeading: {
      color: theme.color.black,
      marginBottom: theme.spacing(2),
      fontSize: '175%',
    },
    searchField: {
      padding: theme.spacing(3),
    },
    searchIcon: {
      marginRight: 0,
      '& svg': {
        color: theme.palette.text.primary,
      },
    },
  });

interface State {
  query: string;
}

export type CombinedProps = AlgoliaProps &
  WithStyles<ClassNames> &
  RouteComponentProps<{}>;

export class SupportSearchLanding extends React.Component<
  CombinedProps,
  State
> {
  searchIndex: any = null;
  state: State = {
    query: '',
  };

  componentDidMount() {
    this.searchFromParams();
  }

  searchFromParams() {
    const query = getQueryParam(this.props.location.search, 'query');
    this.setState({ query });
    this.props.searchAlgolia(query);
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (!prevProps.searchEnabled && this.props.searchEnabled) {
      this.searchFromParams();
    }
  }

  onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value ?? '';
    this.setState({ query: newQuery });
    this.props.history.replace({ search: `?query=${newQuery}` });
    this.props.searchAlgolia(newQuery);
  };

  render() {
    const { classes, searchEnabled, searchError, searchResults } = this.props;
    const { query } = this.state;

    const [docs, community] = searchResults;

    return (
      <Grid container direction="column">
        <Grid item>
          <Grid container alignItems="center">
            <Grid item>
              <H1Header
                title={
                  query.length > 1 ? `Search results for "${query}"` : 'Search'
                }
                data-qa-support-search-landing-title
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          {searchError && <Notice error>{searchError}</Notice>}
          <TextField
            data-qa-search-landing-input
            className={classes.searchBoxInner}
            placeholder="Search Linode documentation and community questions"
            label="Search Linode documentation and community questions"
            hideLabel
            value={query}
            onChange={this.onInputChange}
            disabled={!Boolean(searchEnabled)}
            InputProps={{
              className: classes.searchBar,
              startAdornment: (
                <InputAdornment position="end" className={classes.searchIcon}>
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item>
          <DocumentationResults
            sectionTitle="Documentation"
            results={docs as SearchResult[]}
            target={DOCS_SEARCH_URL + query}
          />
        </Grid>
        <Grid item>
          <DocumentationResults
            sectionTitle="Community Posts"
            results={community as SearchResult[]}
            target={COMMUNITY_SEARCH_URL + query}
          />
        </Grid>
        <Grid container item>
          <HelpResources />
        </Grid>
      </Grid>
    );
  }
}

const styled = withStyles(styles);
const searchable = withSearch({ hitsPerPage: 5, highlight: false });
const enhanced: any = compose(
  styled,
  searchable,
  withRouter
)(SupportSearchLanding);

export default enhanced;
