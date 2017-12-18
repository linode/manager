import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import Banners from '~/components/Banners';
import {
  importantBanner,
  importantBanners,
  abuseBanner,
  abuseBanners,
} from '~/data/banners';


describe('components/Banners', () => {
  const sandbox = sinon.sandbox.create();

  beforeEach(() => {
    sandbox.reset();
  });

  it('renders an important ticket banner', () => {
    const banner = shallow(
      <Banners
        banners={importantBanner}
        params={{}}
        linodes={{ linodes: {} }}
      />
    );

    expect(banner.find('.Banner Link').props().to).toBe(`/support/${importantBanner[0].entity.id}`);
  });

  it('renders when multiple important tickets banner', () => {
    const banner = shallow(
      <Banners
        banners={importantBanners}
        params={{}}
        linodes={{ linodes: {} }}
      />
    );

    expect(banner.find('.Banner Link').props().to).toBe('/support');
  });

  it('renders an abuse ticket banner', () => {
    const banner = shallow(
      <Banners
        banners={abuseBanner}
        params={{}}
        linodes={{ linodes: {} }}
      />
    );

    expect(banner.find('.Banner Link').props().to).toBe(`/support/${abuseBanner[0].entity.id}`);
  });

  it('renders when multiple abuse tickets banner', () => {
    const banner = shallow(
      <Banners
        banners={abuseBanners}
        params={{}}
        linodes={{ linodes: {} }}
      />
    );

    expect(banner.find('.Banner Link').props().to).toBe('/support');
  });
});
