import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount } from 'enzyme';

import Plan from '~/linodes/components/Plan';
import { api } from '@/data';

describe('linodes/components/Plan', () => {
  const { types } = api.types;

  it('dispatched the appropriate event on select', () => {
    const onSelect = sinon.spy();
    const c = mount(
      <Plan
        types={types}
        onServiceSelected={onSelect}
      />
    );

    c.find('.plan').at(1).simulate('click');
    expect(onSelect.callCount).to.equal(1);
    expect(onSelect.firstCall.args[0]).to.equal('linode2048.5');
  });
});
