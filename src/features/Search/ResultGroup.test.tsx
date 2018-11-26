import { ResultGroup } from './ResultGroup';

import { searchbarResult1, searchbarResult2 } from 'src/__data__/searchResults';


const props = {
  redirect: jest.fn(),
  entity: 'linodes',
  classes: { root: '' },
  results: [searchbarResult1, searchbarResult2],
}

const emptyProps = {
  redirect: jest.fn(),
  entity: 'linodes',
  classes: { root: '' },
  results: [],
}

describe("ResultGroup component", () => {
  it("should render", () => {
    expect(ResultGroup(props)).toBeDefined();
  });
  it("should return null if there are no results", () => {
    expect(ResultGroup(emptyProps)).toBeNull();
  });
});