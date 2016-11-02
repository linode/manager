import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount } from 'enzyme';

import Plan from '~/linodes/create/components/Plan';
import { api } from '@/data';

describe('linodes/create/components/Plan', () => {
  const { types } = api.types;

  it('renders the card header', () => {
    const c = mount(
      <Plan
        types={types}
        onServiceSelected={() => {}}
      />
    );

    expect(c.contains(<h2>Plan</h2>)).to.equal(true);
    expect(c.find('.plan').length).to.equal(1);
    expect(c.find('.plan').first().find('header .title')
            .text())
      .to.equal('Linode 2G');
    expect(c.find('.hdd').first().text()).to.equal('24 GB SSD');
  });

  it('dispatched the appropriate event on select', () => {
    const env = { onSelect: () => {} };
    const onSelect = sinon.stub(env, 'onSelect');
    const c = mount(
      <Plan
        types={types}
        onServiceSelected={onSelect}
      />
    );

    c.find('.plan').first().simulate('click');
    expect(onSelect.calledOnce).to.equal(true);
    expect(onSelect.firstCall.args[0]).to.equal('linode2048.5');
  });
});
