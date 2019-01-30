import * as Algolia from 'algoliasearch';
import { pathOr } from 'ramda';
import * as React from 'react';

import { Item } from 'src/components/EnhancedSelect/Select';
import {
  ALGOLIA_APPLICATION_ID,
  ALGOLIA_SEARCH_KEY,
  COMMUNITY_BASE_URL,
  DOCS_BASE_URL
} from 'src/constants';
import truncate from 'src/utilities/truncateText';

interface SearchHit {
  title?: string;
  description?: string;
  keywords?: string[];
  objectID: string;
  href?: string;
  _highlightResult?: any;
}

export interface AlgoliaState {
  searchAlgolia: (inputValue: string) => void;
  searchEnabled: boolean;
  searchError?: string;
  searchResults: [Item[], Item[]];
}

interface SearchOptions {
  hitsPerPage: number;
  highlight: boolean;
}

interface AlgoliaContent {
  results: Algolia.Response[];
}

interface AlgoliaError {
  message: string;
  code: number;
}

// Functional helper methods

export const convertDocsToItems = (
  highlight: boolean,
  hits: SearchHit[] = []
): Item[] => {
  return hits.map((hit: SearchHit, idx: number) => {
    return {
      value: idx,
      label: getDocsResultLabel(hit, highlight),
      data: {
        source: 'Linode documentation',
        href: DOCS_BASE_URL + hit.href
      }
    };
  });
};

export const convertCommunityToItems = (
  highlight: boolean,
  hits: SearchHit[] = []
): Item[] => {
  return hits.map((hit: SearchHit, idx: number) => {
    return {
      value: idx,
      label: getCommunityResultLabel(hit, highlight),
      data: {
        source: 'Linode Community Site',
        href: getCommunityUrl(hit.objectID)
      }
    };
  });
};

export const getCommunityUrl = (id: string) => {
  // Rather than crash here, better to redirect to the base community site.
  if (!id || (!id.startsWith('q_') && !id.startsWith('a_'))) {
    return COMMUNITY_BASE_URL;
  }
  const [prefix, value] = id.split('_');
  return prefix === 'q' // Prefix is q for question, a for answer.
    ? `${COMMUNITY_BASE_URL}questions/${value}`
    : `${COMMUNITY_BASE_URL}questions/answer/${value}`;
};

export const getDocsResultLabel = (hit: SearchHit, highlight: boolean) => {
  return highlight && hit._highlightResult.title
    ? hit._highlightResult.title.value
    : hit.title;
};

export const getCommunityResultLabel = (hit: SearchHit, highlight: boolean) => {
  /* If a word in the title matched the search query, return a string
   * with the matched word highlighted.
   *
   * NOTE: It's currently planned to add the title of the parent question
   * to the index entry for each answer. When that is done, the ternaries
   * below can be removed. In the meantime, answers don't include
   * a title, so use the truncated description.
   */
  const title =
    highlight && hit._highlightResult.title
      ? hit._highlightResult.title.value
      : hit.title;
  return title ? title : truncate(cleanDescription(hit.description!), 30);
};

export const cleanDescription = (description: string): string => {
  return description.replace(/<r>|<t>/, '');
};

export default (options: SearchOptions) => (
  Component: React.ComponentType<any>
) => {
  const { hitsPerPage, highlight } = options;
  class WrappedComponent extends React.PureComponent<{}, AlgoliaState> {
    searchIndex: any;
    mounted: boolean = false;

    componentDidMount() {
      this.mounted = true;
      this.initializeSearchIndices();
    }

    componentWillUnmount() {
      this.mounted = false;
    }

    initializeSearchIndices = () => {
      try {
        const client = Algolia(ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_KEY);
        this.searchIndex = client;
        this.setState({ searchEnabled: true, searchError: undefined });
      } catch {
        // Credentials were incorrect or couldn't be found;
        // Disable search functionality in the component.
        this.setState({
          searchEnabled: false,
          searchError: 'Search could not be enabled.'
        });
        return;
      }
    };

    searchAlgolia = (inputValue: string) => {
      if (!this.mounted) {
        return;
      }
      if (!inputValue) {
        this.setState({ searchResults: [[], []] });
        return;
      }
      if (!this.searchIndex) {
        this.setState({
          searchResults: [[], []],
          searchError: 'Search could not be enabled.'
        });
        return;
      }
      this.searchIndex.search(
        [
          {
            indexName: 'linode-docs',
            query: inputValue,
            params: {
              hitsPerPage,
              attributesToRetrieve: ['title', '_highlightResult', 'href']
            }
          },
          {
            indexName: 'linode-community',
            query: inputValue,
            params: {
              hitsPerPage,
              distinct: true,
              attributesToRetrieve: ['title', 'description', '_highlightResult']
            }
          }
        ],
        this.searchSuccess
      );
    };

    searchSuccess = (err: AlgoliaError, content: AlgoliaContent) => {
      if (!this.mounted) {
        return;
      }
      if (err) {
        /*
         * Errors from Algolia have the format: {'message': string, 'code': number}
         * We do not want to push these messages on to the user as they are not under
         * our control and can be account-related (e.g. "You have exceeded your quota").
         */
        this.setState({
          searchError: 'There was an error retrieving your search results.'
        });
        return;
      }

      /* If err is undefined, the shape of content is guaranteed, but better to be safe: */
      const docs = pathOr([], ['results', 0, 'hits'], content);
      const community = pathOr([], ['results', 1, 'hits'], content);
      const docsResults = convertDocsToItems(highlight, docs);
      const commResults = convertCommunityToItems(highlight, community);
      this.setState({
        searchResults: [docsResults, commResults],
        searchError: undefined
      });
    };

    state: AlgoliaState = {
      searchAlgolia: this.searchAlgolia,
      searchEnabled: false,
      searchError: undefined,
      searchResults: [[], []]
    };

    render() {
      return React.createElement(Component, {
        ...this.props,
        ...this.state
      });
    }
  }
  return WrappedComponent;
};
