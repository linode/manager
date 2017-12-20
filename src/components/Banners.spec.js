import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import Banners from '~/components/Banners';
import {
  importantBanner,
  importantBanners,
  abuseBanner,
  abuseBanners,
  outageBanners,
} from '~/data/banners';


describe('components/Banners', () => {
  const sandbox = sinon.sandbox.create();

  beforeEach(() => {
    sandbox.reset();
  });

  it('renders no banners when no notices are present', () => {
    const banner = shallow(
      <Banners
        banners={[]}
        params={{}}
        linodes={{ linodes: {} }}
      />
    );

    expect(banner.find('.Banner')).toHaveLength(0);
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

  it('renders an outage banner for multiple datacenters', () => {
    const banner = shallow(
      <Banners
        banners={outageBanners}
        params={{}}
        linodes={{ linodes: {} }}
      />
    );

    expect(banner.find('.Banner')).toHaveLength(1);
    const expected = expect.stringMatching('us-east-1a, us-south-1a');
    expect(banner.find('.Banner > div').text()).toEqual(expected);
  });
});
