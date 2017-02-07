import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

import Datacenter from '~/components/Datacenter';
import { flags } from '~/assets';

describe('components/Datacenter', () => {
  const datacenters = {
    newark: {
      id: 'newark',
      label: 'Newark, NJ',
      country: 'us',
    },
  };

  it('renders the datacenters', () => {
    const c = mount(
      <Datacenter
        datacenters={datacenters}
        onDatacenterSelected={() => {}}
      />
    );

    expect(c.find('h2').text()).to.equal('Datacenter');
    expect(c.find('h3').text()).to.equal('North America');
    expect(c.find('.datacenter').length).to.equal(1);
    expect(c.find('.datacenter header .title').text()).to.equal('Newark, NJ');
    const img = c.find('img').props();
    expect(img.src).to.equal(flags[datacenters.newark.country]);
    expect(img.width).to.equal(64);
    expect(img.height).to.equal(64);
    expect(img.alt).to.equal('Newark, NJ');
  });

  it('renders disabled', () => {
    const c = shallow(
      <Datacenter
        datacenters={datacenters}
        selected="newark"
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
      <Datacenter
        datacenters={datacenters}
        onDatacenterSelected={onSelect}
      />
    );

    c.find('.datacenter').simulate('click');
    expect(onSelect.calledOnce).to.equal(true);
    expect(onSelect.firstCall.args[0]).to.equal(datacenters.newark.id);
  });
});
