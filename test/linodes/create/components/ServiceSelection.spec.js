import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount } from 'enzyme';

import ServiceSelection from '~/linodes/create/components/ServiceSelection';
import { state } from '~/../test/data';

describe('linodes/create/components/ServiceSelection', () => {
  const { services } = state.services;

  it('renders the card header', () => {
    const c = mount(
      <ServiceSelection
        services={services}
        onServiceSelected={() => {}}
      />
    );

    expect(c.contains(<h2>Select a plan</h2>)).to.equal(true);
    expect(c.find('.plan').length).to.equal(2);
    expect(c.find('.plan').first().find(
      <header><div>Linode 1024</div></header>
    )).to.exist;
    expect(c.find('.plan').at(1).find(
      <header><div>Linode 2048</div></header>
    )).to.exist;
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

    c.find('.plan').first().simulate('click');
    expect(onSelect.calledOnce).to.equal(true);
    expect(onSelect.firstCall.args[0]).to.equal('linode1024.5');
  });
});
