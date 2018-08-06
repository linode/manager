import { shallow } from 'enzyme';
import * as React from 'react';

import { SearchLanding } from './SearchLanding';

import { createResourcePage } from 'src/utilities/testHelpers';

import { linodes } from 'src/__data__/linodes';
import { reactRouterProps } from 'src/__data__/reactRouterProps';

describe('Search Landing', () => {
  const component = shallow(
    <SearchLanding
      classes={{
        root: '',
        noResultsText: '',
        title: '',
      }}
      {...reactRouterProps}
      location={{
        search: '?query=node'
      }}
    />
  );

  it('should render Search Results Panel if there are search results', () => {
    component.setState({
      isLoading: false,
      linodes: createResourcePage(linodes),
      numberOfResults: 1,
    });
    expect(component.find('WithStyles(SearchResultsPanel)')).toHaveLength(1);
  });

  it('should render text "No Results" if number of results is 0', () => {
    component.setState({
      numberOfResults: 0,
    });
    const resultText = component
      .find('WithStyles(Typography)[variant="subheading"]')
      .last()
      .children()
      .text()
    expect(resultText).toBe('No Results');
  });
});