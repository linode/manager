import { shallow } from 'enzyme';
import { assocPath } from 'ramda';
import * as React from 'react';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { H1Header } from 'src/components/H1Header/H1Header';

import { CombinedProps, SupportSearchLanding } from './SupportSearchLanding';

const classes = {
  backButton: '',
  root: '',
  searchBar: '',
  searchBoxInner: '',
  searchField: '',
  searchHeading: '',
  searchIcon: '',
};

const props: CombinedProps = {
  classes,
  searchAlgolia: jest.fn(),
  searchEnabled: true,
  searchResults: [[], []],
  ...reactRouterProps,
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
        <H1Header
          data-qa-support-search-landing-title={true}
          title='Search results for "search"'
        />
      )
    ).toBeTruthy();
  });
  it('should display generic text if no query is provided', () => {
    component.setState({ query: '' });
    expect(
      component.containsMatchingElement(
        <H1Header data-qa-support-search-landing-title={true} title="Search" />
      )
    ).toBeTruthy();
    expect(
      component.containsMatchingElement(
        <H1Header
          data-qa-support-search-landing-title={true}
          title="Search results for"
        />
      )
    ).toBeFalsy();
  });
});
