/* eslint-disable react-refresh/only-export-components */
import Algolia from 'algoliasearch';
import * as React from 'react';

import {
  ALGOLIA_APPLICATION_ID,
  ALGOLIA_SEARCH_KEY,
  COMMUNITY_BASE_URL,
  DOCS_BASE_URL,
} from 'src/constants';
import { truncate } from 'src/utilities/truncate';

import type { SearchClient } from 'algoliasearch';

interface SearchHit {
  _highlightResult?: any;
  description?: string;
  href?: string;
  keywords?: string[];
  objectID: string;
  title?: string;
}

export interface AlgoliaState {
  searchAlgolia: (inputValue: string) => void;
  searchEnabled: boolean;
  searchError?: string;
  searchResults: [ConvertedItems[], ConvertedItems[]];
}

interface SearchOptions {
  highlight: boolean;
  hitsPerPage: number;
}

interface AlgoliaContent {
  results: unknown;
}

export interface ConvertedItems {
  data: { href: string; source: string };
  label: string;
  value: number;
}

// Functional helper methods
export const convertDocsToItems = (
  highlight: boolean,
  hits: SearchHit[] = []
): ConvertedItems[] => {
  const uniqueHits = new Map<string, ConvertedItems>();
  hits.forEach((hit: SearchHit, idx: number) => {
    const href = DOCS_BASE_URL + hit.href;
    if (!uniqueHits.has(href)) {
      uniqueHits.set(href, {
        data: {
          href,
          source: 'Linode documentation',
        },
        label: getDocsResultLabel(hit, highlight),
        value: idx,
      });
    }
  });
  return Array.from(uniqueHits.values());
};

export const convertCommunityToItems = (
  highlight: boolean,
  hits: SearchHit[] = []
): ConvertedItems[] => {
  const uniqueItems = new Map<string, ConvertedItems>();
  hits.forEach((hit: SearchHit, idx: number) => {
    const href = getCommunityUrl(hit.objectID);
    if (!uniqueItems.has(href)) {
      uniqueItems.set(href, {
        data: {
          href,
          source: 'Linode Community Site',
        },
        label: getCommunityResultLabel(hit, highlight),
        value: idx,
      });
    }
  });
  return Array.from(uniqueItems.values());
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
  const { highlight, hitsPerPage } = options;
  class WrappedComponent extends React.PureComponent<{}, AlgoliaState> {
    client: SearchClient;
    initializeSearchIndices = () => {
      try {
        const client = Algolia(ALGOLIA_APPLICATION_ID, ALGOLIA_SEARCH_KEY);
        this.client = client;
        this.setState({ searchEnabled: true, searchError: undefined });
      } catch {
        // Credentials were incorrect or couldn't be found;
        // Disable search functionality in the component.
        this.setState({
          searchEnabled: false,
          searchError: 'Search could not be enabled.',
        });
        return;
      }
    };

    mounted: boolean = false;

    searchAlgolia = async (inputValue: string) => {
      if (!this.mounted) {
        return;
      }
      if (!inputValue) {
        this.setState({ searchResults: [[], []] });
        return;
      }
      if (!this.client) {
        this.setState({
          searchError: 'Search could not be enabled.',
          searchResults: [[], []],
        });
        return;
      }

      try {
        const results = await this.client.search([
          {
            indexName: 'linode-docs',
            params: {
              attributesToRetrieve: ['title', '_highlightResult', 'href'],
              hitsPerPage,
            },
            query: inputValue,
          },
          {
            indexName: 'linode-community',
            params: {
              attributesToRetrieve: [
                'title',
                'description',
                '_highlightResult',
              ],
              distinct: true,
              hitsPerPage,
            },
            query: inputValue,
          },
        ]);
        this.searchSuccess(results);
      } catch (e) {
        if (!this.mounted) {
          return;
        }
        this.setState({
          searchError: 'There was an error retrieving your search results.',
        });
      }
    };

    searchSuccess = (content: AlgoliaContent) => {
      if (!this.mounted) {
        return;
      }

      /* If err is undefined, the shape of content is guaranteed, but better to be safe: */
      const docs: SearchHit[] =
        (Array.isArray(content.results) &&
          (content.results?.[0] as { hits: SearchHit[] })?.hits) ||
        [];
      const community: SearchHit[] =
        (Array.isArray(content.results) &&
          (content.results?.[1] as { hits: SearchHit[] })?.hits) ||
        [];
      const docsResults = convertDocsToItems(highlight, docs);
      const commResults = convertCommunityToItems(highlight, community);
      this.setState({
        searchError: undefined,
        searchResults: [docsResults, commResults],
      });
    };

    state: AlgoliaState = {
      searchAlgolia: this.searchAlgolia,
      searchEnabled: false,
      searchError: undefined,
      searchResults: [[], []],
    };

    componentDidMount() {
      this.mounted = true;
      this.initializeSearchIndices();
    }

    componentWillUnmount() {
      this.mounted = false;
    }

    render() {
      return React.createElement(Component, {
        ...this.props,
        ...this.state,
      });
    }
  }

  return WrappedComponent;
};
