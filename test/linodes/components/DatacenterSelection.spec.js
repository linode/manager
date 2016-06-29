import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';

import DatacenterSelection, { countryMap } from '~/linodes/components/DatacenterSelection';
import { flags } from '~/assets';

describe('linodes/components/DatacenterSelection', () => {
  const datacenters = {
    datacenters: {
      datacenter_2: {
        id: 'datacenter_2',
        label: 'Newark, NJ',
      },
    },
  };

  it('renders the datacenters', () => {
    const c = mount(
      <DatacenterSelection
        datacenters={datacenters}
        onDatacenterSelected={() => {}}
      />
    );

    expect(c.find(<h2>Select a datacenter</h2>)).to.exist;
    expect(c.find(<h3>North America</h3>)).to.exist;
    expect(c.find(<header><div>Newark, NJ</div></header>)).to.exist;
    expect(c.find(
      <img
        src={flags[countryMap.datacenter_2]}
        width={64}
        height={64}
        alt="Newark, NJ"
      />
    )).to.exist;
  });
});
