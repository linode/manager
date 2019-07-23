import * as algoliasearch from 'algoliasearch';
import { shallow } from 'enzyme';
import * as React from 'react';

import withSearch, {
  cleanDescription,
  convertCommunityToItems,
  convertDocsToItems,
  getCommunityResultLabel,
  getCommunityUrl,
  getDocsResultLabel
} from './SearchHOC';

import {
  community_answer,
  community_question,
  docs_result
} from 'src/__data__/searchResults';
import { COMMUNITY_BASE_URL, DOCS_BASE_URL } from 'src/constants';

const HITS_PER_PAGE = 10;

const mockFn = jest.fn();

jest.mock('algoliasearch', () =>
  jest.fn((key: string, appId: string) => {
    return {
      search: mockFn
    };
  })
);

const mockResults = {
  results: [{ hits: [docs_result] }, { hits: [community_question] }]
};

const emptyResults = {
  results: [{ hits: [] }, { hits: [] }]
};

const getSearchFromQuery = (query: string) => [
  {
    indexName: 'linode-docs',
    query,
    params: {
      hitsPerPage: HITS_PER_PAGE,
      attributesToRetrieve: ['title', '_highlightResult', 'href']
    }
  },
  {
    indexName: 'linode-community',
    query,
    params: {
      hitsPerPage: HITS_PER_PAGE,
      distinct: true,
      attributesToRetrieve: ['title', 'description', '_highlightResult']
    }
  }
];

const searchable = withSearch({ hitsPerPage: HITS_PER_PAGE, highlight: false });
const RawComponent = searchable(React.Component);

const component = shallow(<RawComponent />);

describe('Algolia Search HOC', () => {
  describe('external API', () => {
    afterEach(() => jest.resetAllMocks());
    it('should initialize the index', () => {
      expect(algoliasearch).toHaveBeenCalled();
      expect(component.props().searchEnabled).toBe(true);
    });
    it('should search the Algolia indices', () => {
      const query = getSearchFromQuery('hat');
      component.props().searchAlgolia('hat');
      expect(mockFn).toHaveBeenCalledWith(query, expect.any(Function));
    });
    it('should save an error to state if the request to Algolia fails', () => {
      mockFn.mockImplementationOnce((queries: any, callback: any) =>
        callback({ message: 'I reject this request.', code: 500 }, undefined)
      );
      component.props().searchAlgolia('existentialism');
      expect(component.props().searchError).toEqual(
        'There was an error retrieving your search results.'
      );
    });
    it('should set search results based on the Algolia response', () => {
      mockFn.mockImplementationOnce((queries: any, callback: any) =>
        callback(undefined, mockResults)
      );
      component.props().searchAlgolia('existentialism');
      expect(component.props().searchResults[0]).toHaveLength(1);
      expect(component.props().searchResults[1]).toHaveLength(1);
    });
    it('should set results list to empty on a blank query', () => {
      expect(component.props().searchResults[0]).toHaveLength(1);
      mockFn.mockImplementationOnce((queries: any, callback: any) =>
        callback(undefined, emptyResults)
      );
      component.props().searchAlgolia('existentialism');
      expect(component.props().searchResults[0]).toHaveLength(0);
      expect(component.props().searchResults[1]).toHaveLength(0);
    });
  });
  describe('internal methods', () => {
    describe('getDocsResultLabel', () => {
      it('should return a label with highlighted content marked as <em>', () => {
        const label = getDocsResultLabel(docs_result, true);
        expect(label).toBe(docs_result._highlightResult.title.value);
      });
      it('should use the unformatted title when highlighting is set to false', () => {
        const label2 = getDocsResultLabel(docs_result, false);
        expect(label2).toBe(docs_result.title);
      });
      it('should return an unformatted label if there is no highlighted result', () => {
        const result = { ...docs_result } as any;
        result._highlightResult = {};
        const label3 = getDocsResultLabel(result, true);
        expect(label3).toBe(result.title);
      });
    });
    describe('getCommunityUrl', () => {
      it('should parse a community question', () => {
        expect(getCommunityUrl('q_123')).toMatch('/questions/123');
      });
      it('should parse a community answer', () => {
        expect(getCommunityUrl('a_123')).toMatch('/questions/answer/123');
      });
      it('should handle strange input', () => {
        expect(getCommunityUrl("I'm not a URL")).toEqual(COMMUNITY_BASE_URL);
      });
    });
    describe('cleanDescription', () => {
      it('should return a normal string unchanged', () => {
        expect(cleanDescription('just a description')).toBe(
          'just a description'
        );
      });
      it('should trim a <t> tag', () => {
        expect(cleanDescription('<t>I have a tag')).toBe('I have a tag');
      });
      it('should trim a <r> tag', () => {
        expect(cleanDescription('<r>I also have a tag')).toBe(
          'I also have a tag'
        );
      });
    });
    describe('getCommunityResultLabel', () => {
      it('should use the highlighted title if available', () => {
        const label4 = getCommunityResultLabel(community_question, true);
        expect(label4).toBe(community_question._highlightResult.title.value);
      });
      it('should use the unformatted title if highlight is false', () => {
        const label5 = getCommunityResultLabel(community_question, false);
        expect(label5).toBe(community_question.title);
      });
      it('should use the description if no title is available', () => {
        const label6 = getCommunityResultLabel(community_answer, true);
        expect(label6).toBe(community_answer.description);
      });
      it('should truncate the title', () => {
        const result = { ...community_answer } as any;
        result.description =
          "A much longer description that can't possibly fit on one line of a results list.";
        const label7 = getCommunityResultLabel(result, true);
        expect(label7).toBe('A much longer description that can ...');
      });
    });
    describe('convertDocsToItems', () => {
      it('should convert docs to a correctly formatted Item[]', () => {
        const formattedResults = convertDocsToItems(false, [docs_result]);
        expect(formattedResults).toEqual([
          {
            value: 0,
            label: docs_result.title,
            data: {
              href: DOCS_BASE_URL + docs_result.href,
              source: 'Linode documentation'
            }
          }
        ]);
      });
      it('should handle empty results lists correctly', () => {
        const results = convertDocsToItems(false, []);
        expect(results).toEqual([]);
      });
    });
    describe('convertCommunityToItems', () => {
      it('should convert a community question to a correctly formatted Item', () => {
        const formattedResults = convertCommunityToItems(false, [
          community_question
        ] as any);
        expect(formattedResults).toEqual([
          {
            value: 0,
            label: community_question.title,
            data: {
              source: 'Linode Community Site',
              href: expect.any(String)
            }
          }
        ]);
      });
      it('should convert a community answer to a correctly formatted Item', () => {
        const formattedResults = convertCommunityToItems(false, [
          community_answer
        ] as any);
        expect(formattedResults).toEqual([
          {
            value: 0,
            label: community_question.description,
            data: {
              source: 'Linode Community Site',
              href: expect.any(String)
            }
          }
        ]);
      });
    });
  });
});
