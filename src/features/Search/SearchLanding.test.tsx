import { shallow } from 'enzyme';
import * as React from 'react';

import { SearchLanding } from './SearchLanding';

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

  it('should....', () => {
  });
});