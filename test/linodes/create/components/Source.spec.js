import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount } from 'enzyme';

import Source from '~/linodes/create/components/Source';
import { api } from '@/data';

describe('linodes/create/components/Source', () => {
  const sandbox = sinon.sandbox.create();
  afterEach(() => {
    sandbox.restore();
  });

  it('invokes the onSourceSelected function as necessary for Distributions', () => {
    const onSourceSelected = sandbox.spy();
    const c = mount(
      <Source
        distributions={api.distributions}
        distribution={null}
        onDistroSelected={onSourceSelected}
      />
    );
    const distro = api.distributions.distributions.distro_1234;
    c.find('Distributions').props().onSelected(distro);
    expect(onSourceSelected.callCount).to.equal(1);
    expect(onSourceSelected.firstCall.args[0]).to.equal(distro);
  });
});
