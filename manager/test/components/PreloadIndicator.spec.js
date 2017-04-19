import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { PreloadIndicator } from '~/components/PreloadIndicator';

describe('components/PreloadIndicator', () => {
  it('uses the given mode for the css class', () => {
    const indicator = shallow(<PreloadIndicator mode="running" />);

    expect(indicator.find('.PreloadIndicator').props().className).
      to.equal('PreloadIndicator PreloadIndicator--running');
  });

  it('defaults to no status class when mode set to reset', () => {
    const indicator = shallow(<PreloadIndicator mode="reset" />);

    expect(indicator.find('.PreloadIndicator').props().className).
      to.equal('PreloadIndicator');
  });
});
