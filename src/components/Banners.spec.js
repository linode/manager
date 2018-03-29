import React from 'react';
import { shallow } from 'enzyme';
import { Banners, filterBy } from '~/components/Banners';
import {
  importantBanner,
  importantBanners,
  abuseBanner,
  abuseBanners,
  outstandingBalanceBanner,
  scheduledRebootBanner,
  outageBanners,
  globalBanner,
} from '~/data/banners';

describe('components/Banners filterBy', () => {
  it('should throw if `pred` is not an array.', () => {
    expect(() => filterBy([], undefined)).toThrow(TypeError);
  });

  it('should throw if `data` is not an array.', () => {
    expect(() => filterBy(undefined, [])).toThrow(TypeError);
  });

  it('should filter data by many pred', () => {
    const marques = { role: 'senior developer', residentOf: 'new jersey' };
    const andrew = { role: 'developer', residentOf: 'pennsylvania' };
    const rob = { role: 'developer', residentOf: 'new jersey' };

    const pred = [
      (data) => data.role === 'developer',
      (data) => data.residentOf === 'new jersey',
    ];

    const data = [marques, andrew, rob];

    expect(
      filterBy(pred, data)
    ).toEqual([rob]);
  });

  it('should should filter by one pred', () => {
    const marques = { role: 'senior developer', residentOf: 'new jersey' };
    const andrew = { role: 'developer', residentOf: 'pennsylvania' };
    const rob = { role: 'developer', residentOf: 'new jersey' };

    const pred = [
      (data) => data.role === 'developer',
    ];

    const data = [marques, andrew, rob];

    expect(
      filterBy(pred, data)
    ).toEqual([andrew, rob]);
  });
});

describe('components/Banners', () => {
  const linode = {
    id: 1234,
    label: 'my-linode',
  };

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
        linode={linode}
      />
    );

    expect(banner.find('.Banner Link').props().to).toBe(`/support/${importantBanner[0].entity.id}`);
  });

  it('renders when multiple important tickets banner', () => {
    const banner = shallow(
      <Banners
        banners={importantBanners}
        linode={linode}
      />
    );

    expect(banner.find('.Banner Link').props().to).toBe('/support');
  });

  it('renders an abuse ticket banner', () => {
    const banner = shallow(
      <Banners
        banners={abuseBanner}
        linode={linode}
      />
    );

    expect(banner.find('.Banner Link').props().to).toBe(`/support/${abuseBanner[0].entity.id}`);
  });

  it('renders when multiple abuse tickets banner', () => {
    const banner = shallow(
      <Banners
        banners={abuseBanners}
        linode={linode}
      />
    );

    expect(banner.find('.Banner Link').props().to).toBe('/support');
  });

  it('should render a warning for scheduled reboot banner', () => {
    const wrapper = shallow(
      <Banners
        banners={[scheduledRebootBanner]}
        linode={linode}
      />
    );

    expect(wrapper.find('div.warning').length).toBe(1);
  });

  it('should render a critical for outstanding balance banner', () => {
    const wrapper = shallow(
      <Banners
        banners={[outstandingBalanceBanner]}
        linode={linode}
      />
    );
    expect(wrapper.find('div.critical').length).toBe(1);
    expect(wrapper.find('Link').length).toBe(1);
    expect(wrapper.find('Link').prop('to')).toBe('/billing/payment');
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
    const expected = expect.stringMatching('us-east, us-central');
    expect(banner.find('.Banner > div').text()).toEqual(expected);
  });

  it('renders a global notice banner', () => {
    const banner = shallow(
      <Banners
        banners={globalBanner}
        params={{}}
        linodes={{ linodes: {} }}
      />
    );

    expect(banner.find('.Banner > div').text()).toBe(
      'The new linode cloud manager is in the works!');
  });
});
