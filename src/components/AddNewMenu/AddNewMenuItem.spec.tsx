import * as React from 'react';
import AddNewMenuItem from './AddNewMenuItem';
import { shallow } from 'enzyme';

describe('AddNewMenuItem', () => {
  it('should render without error', () => {
    shallow(
      <AddNewMenuItem
        index={1}
        count={1}
        title="shenanigans"
        body="These be the stories of shennanigans."
        onClick={jest.fn()}
      />);
  });

  it('should render a divider if not the last item', () => {
    const result = shallow(
      <AddNewMenuItem
        index={1}
        count={1}
        title="shenanigans"
        body="These be the stories of shennanigans."
        onClick={jest.fn()}
      />);

    expect(result.dive().find('WithStyles(Divider)')).toHaveLength(1);
  });

  it('should not render a divider if not the last item', () => {
    const result = shallow(
      <AddNewMenuItem
        index={0}
        count={1}
        title="shenanigans"
        body="These be the stories of shennanigans."
        onClick={jest.fn()}
      />);

    expect(result.dive().find('WithStyles(Divider)')).toHaveLength(0);
  });
});
