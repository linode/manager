import { shallow } from 'enzyme';
import * as React from 'react';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { searchbarResult1 } from 'src/__data__/searchResults';

import { ResultRow } from './ResultRow';

const props = {
  result: searchbarResult1,
  classes: {},
  ...reactRouterProps,
}

const component = shallow(
  <ResultRow {...props} />
)

describe("ResultRow component", () => {
  it("should render", () => {
    expect(component).toBeDefined();
  });

});