import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount } from 'enzyme';

import Plan from '~/linodes/create/components/Plan';
import { api } from '@/data';

describe('linodes/create/components/Plan', () => {
  const { services } = api.services;

  it('renders the card header', () => {
    const c = mount(
      <Plan
        services={services}
        onServiceSelected={() => {}}
      />
    );

    expect(c.contains(<h2>Plan</h2>)).to.equal(true);
    expect(c.find('.plan').length).to.equal(1);
    expect(c.find('.plan').first().find(
      <header><div className="title">Linode 2G</div></header>
    )).to.exist;
  });

  it('dispatched the appropriate event on select', () => {
    const env = { onSelect: () => {} };
    const onSelect = sinon.stub(env, 'onSelect');
    const c = mount(
      <Plan
        services={services}
        onServiceSelected={onSelect}
      />
    );

    c.find('.plan').first().simulate('click');
    expect(onSelect.calledOnce).to.equal(true);
    expect(onSelect.firstCall.args[0]).to.equal('linode2048.5');
  });
});
