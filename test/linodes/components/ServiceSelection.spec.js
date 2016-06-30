import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount } from 'enzyme';

import ServiceSelection from '~/linodes/components/ServiceSelection';

describe('linodes/components/ServiceSelection', () => {
  const services = {
    service_112: {
      disk: 24,
      hourly_price: 1,
      id: 'service_112',
      label: 'Linode 1024',
      mbits_out: 25,
      monthly_price: 1000,
      ram: 1024,
      service_type: 'linode',
      transfer: 2000,
      vcpus: 1,
    },
  };

  it('renders the card header', () => {
    const c = mount(
      <ServiceSelection
        services={services}
        onServiceSelected={() => {}}
      />
    );

    expect(c.contains(<h2>Select a plan</h2>)).to.equal(true);
    expect(c.find('.plan').length).to.equal(1);
    expect(c.find(<header><div>Linode 1024</div></header>)).to.exist;
  });

  it('dispatched the appropriate event on select', () => {
    const env = { onSelect: () => {} };
    const onSelect = sinon.stub(env, 'onSelect');
    const c = mount(
      <ServiceSelection
        services={services}
        onServiceSelected={onSelect}
      />
    );

    c.find('.plan').simulate('click');
    expect(onSelect.calledOnce).to.equal(true);
    expect(onSelect.firstCall.args[0]).to.equal(services.service_112);
  });
});
