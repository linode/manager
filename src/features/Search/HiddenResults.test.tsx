import { shallow } from 'enzyme';
import * as React from 'react';

import HiddenResults from './HiddenResults';

const props = {
  results: [],
  showMore: true,
  toggle: jest.fn(),
  redirect: jest.fn(),
  classes: { root: '', button: ''}
}


const component = shallow(
  <HiddenResults {...props} />
)

describe("Hidden results component", () => {
  it("should render", () => {
    expect(component).toBeDefined();
  });
})