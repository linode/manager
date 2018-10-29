import * as algoliasearch from 'algoliasearch';
import { shallow } from 'enzyme';
import * as React from 'react';

import withSearch from './SearchHOC';

const HITS_PER_PAGE = 10;

const mockFn = jest.fn();

jest.mock('algoliasearch', () => jest.fn((key: string, appId: string) => {
  return {
    search: mockFn,
  }
}));

const getSearchFromQuery = (query: string) => [{
  indexName: 'linode-docs',
  query,
  params: {
    hitsPerPage: HITS_PER_PAGE,
    attributesToRetrieve: [
      'title',
      'description',
      '_highlightResult',
      'href',
    ]
  }
}, {
  indexName: 'linode-community',
  query,
  params: {
    hitsPerPage: HITS_PER_PAGE,
    distinct: true,
    attributesToRetrieve: [
      'title',
      'description',
      '_highlightResult',
    ]
  }
}];

const searchable = withSearch({hitsPerPage: HITS_PER_PAGE, highlight: false});
const RawComponent = searchable(React.Component);

const component = shallow(<RawComponent />);

describe("Algolia Search HOC", () => {
  it("should initialize the index", () => {
    expect(algoliasearch).toHaveBeenCalled();
    expect(component.props().searchEnabled).toBe(true);
  });
  it("should search the Algolia indices", () => {
    const query = getSearchFromQuery('hat')
    component.props().searchAlgolia('hat');
    expect(mockFn).toHaveBeenCalledWith(query, expect.any(Function));
  });
  it("should save an error to state if the request to Algolia fails", () => {
    mockFn.mockImplementationOnce((queries: any, callback: any) => callback({message: "I reject this request.", code: 500}, undefined));
    component.props().searchAlgolia('existentialism');
    expect(component.props().searchError).toEqual("There was an error retrieving your search results.");
  });
});