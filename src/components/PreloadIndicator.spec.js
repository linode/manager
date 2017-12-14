import React from 'react';
import { shallow } from 'enzyme';
import { PreloadIndicator } from '~/components/PreloadIndicator';

describe('components/PreloadIndicator', () => {
  it('should render without error', () => {
    const wrapper = shallow(
      <PreloadIndicator mode="running" />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('uses the given mode for the css class', () => {
    const indicator = shallow(<PreloadIndicator mode="running" />);

    expect(indicator.find('.PreloadIndicator').props().className)
      .toBe('PreloadIndicator PreloadIndicator--running');
  });

  it('defaults to no status class when mode set to reset', () => {
    const indicator = shallow(<PreloadIndicator mode="reset" />);

    expect(indicator.find('.PreloadIndicator').props().className).toBe('PreloadIndicator');
  });
});
