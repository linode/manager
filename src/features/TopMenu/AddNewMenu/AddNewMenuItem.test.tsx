import * as React from 'react';
import AddNewMenuItem from './AddNewMenuItem';
import { shallow } from 'enzyme';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';

describe('AddNewMenuItem', () => {
  it('should render without error', () => {
    shallow(
      <AddNewMenuItem
        index={1}
        count={1}
        title="shenanigans"
        body="These be the stories of shennanigans."
        ItemIcon={LinodeIcon}
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
        ItemIcon={LinodeIcon}
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
        ItemIcon={LinodeIcon}
        onClick={jest.fn()}
      />);

    expect(result.dive().find('WithStyles(Divider)')).toHaveLength(0);
  });
});
