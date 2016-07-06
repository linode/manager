import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount } from 'enzyme';

import DatacenterSelection from '~/linodes/create/components/DatacenterSelection';
import { countryMap } from '~/constants';
import { flags } from '~/assets';

describe('linodes/create/components/DatacenterSelection', () => {
  const datacenters = {
    datacenter_2: {
      id: 'datacenter_2',
      label: 'Newark, NJ',
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
    expect(c.find('.datacenter').length).to.equal(1);
    expect(c.find(<header><label>Newark, NJ</label></header>)).to.exist;
    expect(c.find(
      <img
        src={flags[countryMap.datacenter_2]}
        width={64}
        height={64}
        alt="Newark, NJ"
      />
    )).to.exist;
  });

  it('dispatches the appropriate event on select', () => {
    const env = { onSelect: () => {} };
    const onSelect = sinon.stub(env, 'onSelect');
    const c = mount(
      <DatacenterSelection
        datacenters={datacenters}
        onDatacenterSelected={onSelect}
      />
    );

    c.find('.datacenter').simulate('click');
    expect(onSelect.calledOnce).to.equal(true);
    expect(onSelect.firstCall.args[0]).to.equal(datacenters.datacenter_2);
  });
});
