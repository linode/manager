import { shallow } from 'enzyme';
import * as React from 'react';

import { searchbarResult1, searchbarResult2 } from 'src/__data__/searchResults';
import Typography from 'src/components/core/Typography';

import { ResultGroup } from './ResultGroup';

const props = {
  redirect: jest.fn(),
  entity: 'linodes',
  classes: { root: ''},
  results: [searchbarResult1, searchbarResult2],
}

const emptyProps = {
  redirect: jest.fn(),
  entity: 'linodes',
  classes: { root: ''},
  results: [],
}

const component = shallow(
  <ResultGroup {...props} />
)

describe("ResultGroup component", () => {
  it("should render", () => {
    expect(component).toBeDefined();
  });
  it("should return null if there are no results", () => {
    expect(ResultGroup(emptyProps)).toBeNull();
  });
  it("should render the capitalized entity label", () => {
    expect(component.containsMatchingElement(
      <Typography >
        Linodes
      </Typography>
    )).toBeTruthy();
  });
  it("should render its children", () => {
    expect(component.find('[data-qa-result-row]')).toHaveLength(2);
  });
});