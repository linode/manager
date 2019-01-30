/*
 * IMPORTANT NOTE:
 * These tests have been skipped for now to address a cyclic dependency issue. Once services/linodes and
 * services/domains no longer require src/store, we should restore these tests.
 */

import { shallow } from 'enzyme';
import { assocPath } from 'ramda';
import * as React from 'react';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { searchbarResult1 } from 'src/__data__/searchResults';
import Typography from 'src/components/core/Typography';

import { SearchLanding } from './SearchLanding';
import { emptyResults } from './utils';

const classes = {
  root: '',
  title: ''
};

const props = {
  classes,
  entities: emptyResults,
  entitiesLoading: false,
  searchResults: emptyResults,
  search: jest.fn(),
  errors: {
    hasErrors: false,
    linodes: false,
    domains: false,
    nodebalancers: false,
    images: false
  },
  ...reactRouterProps
};

const component = shallow(
  <div />
  // <SearchLanding {...props} />
);

describe.skip('Component', () => {
  // describe('Component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  it('should search on mount', () => {
    const newProps = assocPath(['location', 'search'], '?query=search', props);
    shallow(<SearchLanding {...newProps} />);
    expect(props.search).toHaveBeenCalledWith('search');
  });
  it('should show a loading state', () => {
    component.setProps({ entitiesLoading: true });
    expect(component.find('[data-qa-search-loading]')).toHaveLength(1);
    component.setProps({ entitiesLoading: false });
  });
  it('should search when the entity list (from Redux) changes', () => {
    jest.resetAllMocks();
    component.setProps({
      entities: { ...emptyResults, linodes: [searchbarResult1] }
    });
    expect(props.search).toHaveBeenCalledTimes(1);
  });
  it('should show an empty state', () => {
    component.setState({ error: false, results: emptyResults, loading: false });
    expect(component.find('[data-qa-error-state]')).toHaveLength(0);
    expect(component.find('[data-qa-empty-state]')).toHaveLength(1);
  });
  it('should read the query from params', () => {
    expect(component.state()).toHaveProperty('query', 'search');
  });
  it('should display the query term', () => {
    expect(
      component.containsMatchingElement(
        <Typography>Search Results for "search"</Typography>
      )
    ).toBeTruthy();
  });
  it('should parse multi-word queries correctly', () => {
    const newProps = assocPath(
      ['location', 'search'],
      '?query=two%20words',
      props
    );
    const _component = shallow(<div {...newProps} />);
    // const _component = shallow(<SearchLanding {...newProps} />)
    expect(_component.state()).toHaveProperty('query', 'two words');
  });
  it('should handle blank or unusual queries without crashing', () => {
    const newProps = assocPath(['location', 'search'], '?query=', props);
    const _component = shallow(<div {...newProps} />);
    // const _component = shallow(<SearchLanding {...newProps} />);
    expect(_component).toBeDefined();
    expect(_component.state()).toHaveProperty('query', '');
  });
});
