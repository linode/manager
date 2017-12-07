import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import Banners from '~/components/Banners';
import { singleBanner, banners } from '~/data/banners';


describe('components/Banners', () => {
  const sandbox = sinon.sandbox.create();

  beforeEach(() => {
    sandbox.reset();
  });

  it('renders an important ticket banner', () => {
    const banner = shallow(
      <Banners
        banners={singleBanner}
      />
    );

    expect(banner.find('.Banner Link').props().to).toBe(`/support/${singleBanner[0].entity.id}`);
  });

  it('renders when multiple important tickets banner', () => {
    const banner = shallow(
      <Banners
        banners={banners}
      />
    );

    expect(banner.find('.Banner Link').props().to).toBe('/support');
  });
});
