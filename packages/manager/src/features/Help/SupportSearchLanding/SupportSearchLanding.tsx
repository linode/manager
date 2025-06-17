import { Box, H1Header, InputAdornment, Notice, TextField } from '@linode/ui';
import { getQueryParamFromQueryString } from '@linode/utilities';
import Search from '@mui/icons-material/Search';
import Grid from '@mui/material/Grid';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { COMMUNITY_SEARCH_URL, DOCS_SEARCH_URL } from 'src/constants';

import withSearch from '../SearchHOC';
import { DocumentationResults } from './DocumentationResults';
import HelpResources from './HelpResources';

import type { AlgoliaState as AlgoliaProps } from '../SearchHOC';
import type { SearchResult } from './DocumentationResults';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
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
  searchIcon: {
    '& svg': {
      color: theme.palette.text.primary,
    },
    marginRight: 0,
  },
}));

const SupportSearchLanding = (props: AlgoliaProps) => {
  const navigate = useNavigate();
  const { searchAlgolia, searchEnabled, searchError, searchResults } = props;
  const [docs, community] = searchResults;
  const { classes } = useStyles();

  const [queryString, setQueryString] = React.useState('');

  React.useEffect(() => {
    searchFromParams();
  }, []);

  const searchFromParams = () => {
    const query = getQueryParamFromQueryString(location.search, 'query');
    setQueryString(query);
    searchAlgolia(query);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value ?? '';
    setQueryString(newQuery);
    navigate({ to: '/search', search: { query: newQuery } });
    searchAlgolia(newQuery);
  };

  return (
    <Grid container data-testid="support-search-landing" direction="column">
      <Box
        sx={{
          marginBottom: '16px',
        }}
      >
        <H1Header
          data-qa-support-search-landing-title
          dataQaEl={queryString}
          title={
            queryString.length > 1
              ? `Search results for "${queryString}"`
              : 'Search'
          }
        />
      </Box>
      <Box>
        {searchError && <Notice variant="error">{searchError}</Notice>}
        <TextField
          className={classes.searchBoxInner}
          data-qa-search-landing-input
          disabled={!searchEnabled}
          hideLabel
          InputProps={{
            className: classes.searchBar,
            startAdornment: (
              <InputAdornment className={classes.searchIcon} position="end">
                <Search />
              </InputAdornment>
            ),
          }}
          label="Search Linode documentation and community questions"
          onChange={onInputChange}
          placeholder="Search Linode documentation and community questions"
          value={queryString}
        />
      </Box>
      <Box>
        <DocumentationResults
          results={docs as SearchResult[]}
          sectionTitle="Documentation"
          target={DOCS_SEARCH_URL + queryString}
        />
      </Box>
      <Box>
        <DocumentationResults
          results={community as SearchResult[]}
          sectionTitle="Community Posts"
          target={COMMUNITY_SEARCH_URL + queryString}
        />
      </Box>
      <HelpResources />
    </Grid>
  );
};

export default withSearch({ highlight: false, hitsPerPage: 5 })(
  SupportSearchLanding
);
