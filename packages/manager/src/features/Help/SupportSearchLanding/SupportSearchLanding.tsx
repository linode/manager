import Search from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { WithStyles, createStyles, withStyles } from '@mui/styles';
import { compose } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { H1Header } from 'src/components/H1Header/H1Header';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import InputAdornment from 'src/components/core/InputAdornment';
import { COMMUNITY_SEARCH_URL, DOCS_SEARCH_URL } from 'src/constants';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';

import withSearch, { AlgoliaState as AlgoliaProps } from '../SearchHOC';
import DocumentationResults, { SearchResult } from './DocumentationResults';
import HelpResources from './HelpResources';

type ClassNames =
  | 'root'
  | 'searchBar'
  | 'searchBoxInner'
  | 'searchField'
  | 'searchHeading'
  | 'searchIcon';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'flex-start',
      maxWidth: '100%',
      position: 'relative',
    },
    searchBar: {
      maxWidth: '100%',
    },
    searchBoxInner: {
      '& > div': {
        maxWidth: '100%',
      },
      backgroundColor: theme.color.grey2,
      marginTop: 0,
      padding: theme.spacing(3),
    },
    searchField: {
      padding: theme.spacing(3),
    },
    searchHeading: {
      color: theme.color.black,
      fontSize: '175%',
      marginBottom: theme.spacing(2),
    },
    searchIcon: {
      '& svg': {
        color: theme.palette.text.primary,
      },
      marginRight: 0,
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
  componentDidMount() {
    this.searchFromParams();
  }
  componentDidUpdate(prevProps: CombinedProps) {
    if (!prevProps.searchEnabled && this.props.searchEnabled) {
      this.searchFromParams();
    }
  }

  render() {
    const { classes, searchEnabled, searchError, searchResults } = this.props;
    const { query } = this.state;

    const [docs, community] = searchResults;

    return (
      <Grid container direction="column">
        <Box
          sx={{
            marginBottom: '16px',
          }}
        >
          <H1Header
            title={
              query.length > 1 ? `Search results for "${query}"` : 'Search'
            }
            data-qa-support-search-landing-title
          />
        </Box>
        <Box>
          {searchError && <Notice error>{searchError}</Notice>}
          <TextField
            InputProps={{
              className: classes.searchBar,
              startAdornment: (
                <InputAdornment className={classes.searchIcon} position="end">
                  <Search />
                </InputAdornment>
              ),
            }}
            className={classes.searchBoxInner}
            data-qa-search-landing-input
            disabled={!Boolean(searchEnabled)}
            hideLabel
            label="Search Linode documentation and community questions"
            onChange={this.onInputChange}
            placeholder="Search Linode documentation and community questions"
            value={query}
          />
        </Box>
        <Box>
          <DocumentationResults
            results={docs as SearchResult[]}
            sectionTitle="Documentation"
            target={DOCS_SEARCH_URL + query}
          />
        </Box>
        <Box>
          <DocumentationResults
            results={community as SearchResult[]}
            sectionTitle="Community Posts"
            target={COMMUNITY_SEARCH_URL + query}
          />
        </Box>
        <HelpResources />
      </Grid>
    );
  }

  searchFromParams() {
    const query = getQueryParamFromQueryString(
      this.props.location.search,
      'query'
    );
    this.setState({ query });
    this.props.searchAlgolia(query);
  }

  onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value ?? '';
    this.setState({ query: newQuery });
    this.props.history.replace({ search: `?query=${newQuery}` });
    this.props.searchAlgolia(newQuery);
  };

  searchIndex: any = null;

  state: State = {
    query: '',
  };
}

const styled = withStyles(styles);
const searchable = withSearch({ highlight: false, hitsPerPage: 5 });
const enhanced: any = compose(
  styled,
  searchable,
  withRouter
)(SupportSearchLanding);

export default enhanced;
