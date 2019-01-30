import { shallow } from 'enzyme';
import { assocPath } from 'ramda';
import * as React from 'react';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import Typography from 'src/components/core/Typography';
import { SupportSearchLanding } from './SupportSearchLanding';

const classes = {
  root: '',
  backButton: '',
  searchBar: '',
  searchBoxInner: '',
  searchHeading: '',
  searchField: '',
  searchIcon: ''
};

const props = {
  classes,
  searchAlgolia: jest.fn(),
  searchResults: [],
  searchEnabled: true,
  ...reactRouterProps
};

const propsWithMultiWordURLQuery = assocPath(
  ['location', 'search'],
  '?query=search%20two%20words',
  props
);
const component = shallow<SupportSearchLanding>(
  <SupportSearchLanding {...props} />
);
// Query is read on mount so we have to mount twice.
const component2 = shallow<SupportSearchLanding>(
  <SupportSearchLanding {...propsWithMultiWordURLQuery} />
);

describe('Component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  it('should set the query from the URL param to state', () => {
    expect(component.state().query).toMatch('search');
  });
  it('should read multi-word queries correctly', () => {
    expect(component2.state().query).toMatch('search two words');
  });
  it('should display the query text in the header', () => {
    expect(
      component.containsMatchingElement(
        <Typography variant="h1">Search results for "search"</Typography>
      )
    ).toBeTruthy();
  });
  it('should display generic text if no query is provided', () => {
    component.setState({ query: '' });
    expect(
      component.containsMatchingElement(
        <Typography variant="h1">Search</Typography>
      )
    ).toBeTruthy();
    expect(
      component.containsMatchingElement(
        <Typography variant="h1">Search results for</Typography>
      )
    ).toBeFalsy();
  });
});
