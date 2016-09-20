import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

import DatacenterSelection from '~/linodes/create/components/DatacenterSelection';
import { flags } from '~/assets';

describe('linodes/create/components/DatacenterSelection', () => {
  const datacenters = {
    newark: {
      id: 'newark',
      label: 'Newark, NJ',
      country: 'us',
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
        src={flags[datacenters.newark.country]}
        width={64}
        height={64}
        alt="Newark, NJ"
      />
    )).to.exist;
  });

  it('renders disabled', () => {
    const c = shallow(
      <DatacenterSelection
        datacenters={datacenters}
        selected={'newark'}
        onDatacenterSelected={() => {}}
        disabled
      />
    );

    expect(c.contains(
      <p>
        The source you selected limits the datacenters you may deploy
        your new Linode to.
      </p>)).to.equal(true);
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
    expect(onSelect.firstCall.args[0]).to.equal(datacenters.newark.id);
  });
});
