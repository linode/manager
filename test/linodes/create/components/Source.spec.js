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

  it('invokes the onTabChange function as necessary', () => {
    const onTabChange = sandbox.spy();
    const c = mount(
      <Source
        distributions={api.distributions}
        linodes={api.linodes}
        distribution={null}
        backup={null}
        selectedIndex={0}
        onTabChange={onTabChange}
      />);
    c.find('Tabs').first().props()
      .onClick(1);
    expect(onTabChange.callCount).to.equal(1);
    expect(onTabChange.calledWith(1)).to.equal(true);
  });

  it('renders Distributions', () => {
    const c = mount(
      <Source
        distributions={api.distributions.distributions}
        linodes={api.linodes}
        distribution={null}
        backup={null}
        selectedIndex={0}
      />);

    expect(c.find('Distributions').length).to.equal(1);
  });

  it('invokes the onSourceSelected function as necessary for Distributions', () => {
    const onSourceSelected = sandbox.spy();
    const c = mount(
      <Source
        distributions={api.distributions}
        linodes={api.linodes}
        distribution={null}
        backup={null}
        selectedIndex={0}
        onSourceSelected={onSourceSelected}
      />
    );
    const distro = api.distributions.distributions.distro_1234;
    c.find('Distributions').props()
     .onSelected(distro);
    expect(onSourceSelected.callCount).to.equal(1);
    expect(onSourceSelected.calledWith('distribution', distro)).to.equal(true);
  });
});
