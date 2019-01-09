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
  title: '',
}

const props = {
  classes,
  entities: emptyResults,
  searchResults: emptyResults,
  search: jest.fn(),
  ...reactRouterProps,
}

const component = shallow(
  <SearchLanding {...props} />
)

describe('Component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  it("should search on mount", () => {
    const newProps = assocPath(['location','search'], '?query=search', props);
    shallow(<SearchLanding {...newProps} />);
    expect(props.search).toHaveBeenCalledWith('search');
  });
  it("should search when the entity list (from Redux) changes", () => {
    jest.resetAllMocks();
    component.setProps({ entities: {...emptyResults, linodes: [searchbarResult1] }});
    expect(props.search).toHaveBeenCalledTimes(1);
  });
  it("should show an error state", () => {
    expect(component.find('[data-qa-error-state]')).toHaveLength(0);
    component.setState({ error: true });
    expect(component.find('[data-qa-error-state]')).toHaveLength(1);
  });
  it("should show an empty state", () => {
    component.setState({ error: false, results: emptyResults, loading: false });
    expect(component.find('[data-qa-error-state]')).toHaveLength(0);
    expect(component.find('[data-qa-empty-state]')).toHaveLength(1);
  });
  it("should read the query from params", () => {
    expect(component.state()).toHaveProperty('query', 'search');
  });
  it("should display the query term", () => {
    expect(component.containsMatchingElement(
      <Typography>Search Results for "search"</Typography>
    )).toBeTruthy();
  });
  it("should parse multi-word queries correctly", () => {
    const newProps = assocPath(['location','search'], '?query=two%20words', props);
    const _component = shallow(<SearchLanding {...newProps} />)
    expect(_component.state()).toHaveProperty('query', 'two words');
  });
  it("should handle blank or unusual queries without crashing", () => {
    const newProps = assocPath(['location','search'], '?query=', props);
    const _component = shallow(<SearchLanding {...newProps} />);
    expect(_component).toBeDefined();
    expect(_component.state()).toHaveProperty('query', '');
  });
});